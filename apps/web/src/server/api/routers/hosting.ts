import type { ProtectedProcedureContext } from "@/server/api/trpc";
import { env } from "@/env";
import { prefixId } from "@/lib/api/ids";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import { deleteAsset, uploadImage } from "@/lib/s3/assets";
import z from "@/lib/zod";
import { slugSchema, uploadedImageSchema } from "@/schemas/api/misc";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { waitUntil } from "@vercel/functions";
import { nanoid } from "nanoid";

import { Prisma } from "@agentset/db";

const commonInput = z.object({
  namespaceId: z.string(),
});

const getHosting = async (
  ctx: ProtectedProcedureContext,
  input: z.infer<typeof commonInput>,
) => {
  const hosting = await ctx.db.hosting.findFirst({
    where: {
      namespace: {
        id: input.namespaceId,
        organization: {
          members: { some: { userId: ctx.session.user.id } },
        },
      },
    },
    include: {
      domain: true,
      namespace: {
        select: {
          organization: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return hosting ?? null;
};

// TODO: only allow for pro users
export const hostingRouter = createTRPCRouter({
  get: protectedProcedure.input(commonInput).query(async ({ ctx, input }) => {
    return getHosting(ctx, input);
  }),
  enable: protectedProcedure
    .input(
      commonInput.extend({
        title: z.string().min(1),
        slug: slugSchema,
        protected: z.boolean(),
        allowedEmails: z
          .array(z.string().email().trim().toLowerCase())
          .optional(),
        allowedEmailDomains: z
          .array(z.string().trim().toLowerCase())
          .optional(),
        systemPrompt: z.string().optional(),
        examplesQuestions: z.array(z.string()).max(4).optional(),
        exampleSearchQueries: z.array(z.string()).max(4).optional(),
        welcomeMessage: z.string().optional(),
        citationMetadataPath: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const namespace = await ctx.db.namespace.findUnique({
        where: {
          id: input.namespaceId,
          organization: {
            members: { some: { userId: ctx.session.user.id } },
          },
        },
        select: {
          id: true,
          hosting: true,
        },
      });

      if (!namespace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Namespace not found",
        });
      }

      if (namespace.hosting) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hosting already enabled",
        });
      }

      // Check if slug is already taken
      const existingHosting = await ctx.db.hosting.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
        },
      });

      if (existingHosting) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Slug is already taken",
        });
      }

      return ctx.db.hosting.create({
        data: {
          namespaceId: namespace.id,
          title: input.title,
          slug: input.slug,
          protected: input.protected,
          allowedEmails: input.allowedEmails ?? [],
          allowedEmailDomains: input.allowedEmailDomains ?? [],
          systemPrompt: input.systemPrompt ?? DEFAULT_SYSTEM_PROMPT.compile(),
          exampleQuestions: input.examplesQuestions,
          exampleSearchQueries: input.exampleSearchQueries,
          welcomeMessage: input.welcomeMessage,
          citationMetadataPath: input.citationMetadataPath,
        },
      });
    }),
  update: protectedProcedure
    .input(
      commonInput.extend({
        title: z.string().min(1).optional(),
        slug: slugSchema.optional(),
        logo: uploadedImageSchema.nullish(),
        protected: z.boolean().optional(),
        allowedEmails: z
          .array(z.string().email().trim().toLowerCase())
          .optional(),
        allowedEmailDomains: z
          .array(z.string().trim().toLowerCase())
          .optional(),
        systemPrompt: z.string().optional(),
        examplesQuestions: z.array(z.string()).max(4).optional(),
        exampleSearchQueries: z.array(z.string()).max(4).optional(),
        welcomeMessage: z.string().optional(),
        citationMetadataPath: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hosting = await getHosting(ctx, input);

      if (!hosting) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hosting not found",
        });
      }

      const newLogo = input.logo
        ? await uploadImage(
            `organizations/${prefixId(hosting.namespace.organization.id, "org_")}/hosting/logo_${nanoid(7)}`,
            input.logo,
          )
        : input.logo === null
          ? null
          : undefined;

      try {
        const updatedHosting = await ctx.db.hosting.update({
          where: {
            id: hosting.id,
          },
          data: {
            title: input.title,
            ...(input.slug && { slug: input.slug }),
            ...(newLogo !== undefined && {
              logo: newLogo ? newLogo.url : null,
            }),
            protected: input.protected,
            allowedEmails: input.allowedEmails ?? [],
            allowedEmailDomains: input.allowedEmailDomains ?? [],
            systemPrompt: input.systemPrompt,
            exampleQuestions: input.examplesQuestions,
            exampleSearchQueries: input.exampleSearchQueries,
            welcomeMessage: input.welcomeMessage,
            citationMetadataPath: input.citationMetadataPath,
          },
        });

        // Delete old logo if it exists
        if ((newLogo || newLogo === null) && hosting.logo) {
          waitUntil(
            deleteAsset(hosting.logo.replace(`${env.ASSETS_S3_URL}/`, "")),
          );
        }

        return updatedHosting;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `The slug "${input.slug}" is already in use.`,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "An unknown error occurred",
          });
        }
      }
    }),
});
