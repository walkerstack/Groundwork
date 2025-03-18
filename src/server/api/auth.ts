import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import type { ProtectedProcedureContext } from "./trpc";

export const getServerAuthSession = cache(async (headersObj?: Headers) =>
  auth.api.getSession({
    headers: headersObj ?? (await headers()),
  }),
);

export const getNamespaceByUser = cache(
  async (
    ctx: ProtectedProcedureContext,
    idOrSlug:
      | {
          id: string;
        }
      | {
          slug: string;
        },
  ) => {
    return await ctx.db.namespace.findFirst({
      where: {
        ...("id" in idOrSlug ? { id: idOrSlug.id } : { slug: idOrSlug.slug }),
        organization: {
          members: { some: { userId: ctx.session.user.id } },
        },
      },
    });
  },
);
