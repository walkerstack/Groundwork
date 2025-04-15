import type { ProtectedProcedureContext } from "@/server/api/trpc";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const namespace = await ctx.db.namespace.findUnique({
        where: { slug: input },
      });

      return !!namespace;
    }),
  createNamespace: protectedProcedure
    .input(z.object({ orgId: z.string(), name: z.string(), slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await validateIsMember(ctx, input.orgId, ["admin", "owner"]);

      const [namespace] = await ctx.db.$transaction([
        ctx.db.namespace.create({
          data: {
            name: input.name,
            slug: input.slug,
            organizationId: input.orgId,
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
