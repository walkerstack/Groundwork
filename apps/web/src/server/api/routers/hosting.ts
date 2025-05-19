import type { ProtectedProcedureContext } from "@/server/api/trpc";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import z from "@/lib/zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
        protected: z.boolean(),
        systemPrompt: z.string().optional(),
        examples: z.array(z.string()).max(4).optional(),
        welcomeMessage: z.string().optional(),
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

      return ctx.db.hosting.create({
        data: {
          namespaceId: namespace.id,
          protected: input.protected,
          systemPrompt: input.systemPrompt ?? DEFAULT_SYSTEM_PROMPT.compile(),
          exampleQuestions: input.examples,
          welcomeMessage: input.welcomeMessage,
        },
      });
    }),
  update: protectedProcedure
    .input(
      commonInput.extend({
        protected: z.boolean().optional(),
        systemPrompt: z.string().optional(),
        examples: z.array(z.string()).max(4).optional(),
        welcomeMessage: z.string().optional(),
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

      return ctx.db.hosting.update({
        where: {
          id: hosting.id,
        },
        data: {
          protected: input.protected,
          systemPrompt: input.systemPrompt,
          exampleQuestions: input.examples,
          welcomeMessage: input.welcomeMessage,
        },
      });
    }),
});
