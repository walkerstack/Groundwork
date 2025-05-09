import type { ProtectedProcedureContext } from "@/server/api/trpc";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  validateEmbeddingModel,
  validateVectorStoreConfig,
} from "@/services/namespaces/validate";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { EmbeddingConfigSchema, VectorStoreSchema } from "@agentset/validation";

const validateIsMember = async (
  ctx: ProtectedProcedureContext,
  orgId: string,
  roles?: string[],
) => {
  const member = await ctx.db.member.findFirst({
    where: {
      userId: ctx.session.user.id,
      organizationId: orgId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!member) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (roles && !roles.includes(member.role)) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
};

export const namespaceRouter = createTRPCRouter({
  getOrgNamespaces: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await validateIsMember(ctx, input.orgId);

      const namespaces = await ctx.db.namespace.findMany({
        where: {
          organizationId: input.orgId,
        },
      });

      return namespaces;
    }),

  getNamespaceBySlug: protectedProcedure
    .input(z.object({ orgSlug: z.string(), slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const namespace = await ctx.db.namespace.findFirst({
        where: {
          slug: input.slug,
          organization: {
            slug: input.orgSlug,
            members: { some: { userId: ctx.session.user.id } },
          },
        },
      });

      return namespace;
    }),
  checkSlug: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const namespace = await ctx.db.namespace.findUnique({
        where: {
          organizationId_slug: {
            slug: input.slug,
            organizationId: input.orgId,
          },
        },
      });

      return !!namespace;
    }),
  createNamespace: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
        name: z.string(),
        slug: z.string(),
        embeddingConfig: EmbeddingConfigSchema.optional(),
        vectorStoreConfig: VectorStoreSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await validateIsMember(ctx, input.orgId, ["admin", "owner"]);

      const { success: isValidEmbedding, error: embeddingError } =
        await validateEmbeddingModel(input.embeddingConfig);
      if (!isValidEmbedding) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: embeddingError,
        });
      }

      const { success: isValidVectorStore, error: vectorStoreError } =
        await validateVectorStoreConfig(
          input.vectorStoreConfig,
          input.embeddingConfig,
        );
      if (!isValidVectorStore) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: vectorStoreError,
        });
      }

      const [namespace] = await ctx.db.$transaction([
        ctx.db.namespace.create({
          data: {
            name: input.name,
            slug: input.slug,
            organizationId: input.orgId,
            embeddingConfig: input.embeddingConfig,
            vectorStoreConfig: input.vectorStoreConfig,
          },
        }),
        ctx.db.organization.update({
          where: { id: input.orgId },
          data: { totalNamespaces: { increment: 1 } },
        }),
      ]);

      return namespace;
    }),
});
