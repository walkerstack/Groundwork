import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parse } from "@/lib/middleware/utils";
import { getSessionCookie } from "better-auth/cookies";

import { db } from "@agentset/db";

import type { Session } from "../auth-types";

const getSession = async (req: NextRequest) => {
  const url = `${req.nextUrl.origin}/api/auth/get-session`;

  const response = await fetch(url, {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      "Content-Type": "application/json",
    },
  });

  const data = (await response.json()) as Session | null;

  return data;
};

export default async function AppMiddleware(req: NextRequest) {
  const { path, fullPath } = parse(req);

  const cookies = getSessionCookie(req);

  // if the user is not logged in, and is trying to access a dashboard page, redirect to login
  if (
    !cookies &&
    !(path.startsWith("/login") || path.startsWith("/invitation"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (cookies) {
    // redirect to default organization
    if (["/", "/login"].includes(path)) {
      const session = await getSession(req);

      const defaultOrg = await db.organization.findFirst({
        where: {
          ...(session?.session.activeOrganizationId
            ? {
                id: session.session.activeOrganizationId,
              }
            : {
                members: {
                  some: {
                    userId: session?.user.id,
                  },
                },
              }),
        },
        select: {
          id: true,
          slug: true,
        },
      });

      if (!defaultOrg) {
        return NextResponse.redirect(new URL("/create-organization", req.url));
      }

      const namespace = await db.namespace.findFirst({
        where: {
          organizationId: defaultOrg.id,
        },
        select: {
          slug: true,
        },
      });

      if (namespace) {
        return NextResponse.redirect(
          new URL(`/${defaultOrg.slug}/${namespace.slug}`, req.url),
        );
      }

      return NextResponse.redirect(
        new URL(`/${defaultOrg.slug}/create-namespace`, req.url),
      );
    }

    // if the url is /[orgSlug] only, find the namespace and redirect to the namespace
    if (
      !["/profile", "/create-organization"].includes(path) &&
      path.split("/").length === 2
    ) {
      const session = await getSession(req);
      const orgSlug = path.split("/")[1];
      const org = await db.organization.findFirst({
        where: {
          slug: orgSlug,
          members: {
            some: {
              userId: session?.user.id,
            },
          },
        },
        select: {
          id: true,
          slug: true,
          namespaces: {
            take: 1,
            select: {
              slug: true,
            },
          },
        },
      });

      // not found
      if (!org) {
        return NextResponse.error();
      }

      const namespace = org.namespaces[0];
      if (!namespace) {
        // no namespaces
        return NextResponse.redirect(
          new URL(`/${org.slug}/create-namespace`, req.url),
        );
      }

      return NextResponse.redirect(
        new URL(`/${org.slug}/${namespace.slug}`, req.url),
      );
    }
  }

  // otherwise, rewrite the path to /app
  return NextResponse.rewrite(new URL(`/app.agentset.ai${fullPath}`, req.url));
}
