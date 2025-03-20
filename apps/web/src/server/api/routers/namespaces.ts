import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const namespaceRouter = createTRPCRouter({
  getOrgNamespaces: protectedProcedure
    .input(
      z.object({
        orgId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // make sure the user is a member of the org
      const member = await ctx.db.member.findFirst({
        where: {
          userId: ctx.session.user.id,
          organizationId: input.orgId,
        },
        select: {
          id: true,
        },
      });

      if (!member) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

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
  createNamespace: protectedProcedure
    .input(z.object({ orgId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.member.findFirst({
        where: {
          userId: ctx.session.user.id,
          organizationId: input.orgId,
        },
      });

      if (!member || (member.role !== "admin" && member.role !== "owner")) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const slug = input.name.toLowerCase().replace(/ /g, "-");
      const namespace = await ctx.db.namespace.create({
        data: { name: input.name, slug, organizationId: input.orgId },
      });

      return namespace;
    }),
});
