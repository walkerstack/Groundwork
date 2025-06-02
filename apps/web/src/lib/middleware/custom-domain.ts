import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parse } from "@/lib/middleware/utils";

import { db } from "@agentset/db";

import { getMiddlewareSession } from "./get-session";

export default async function CustomDomainMiddleware(req: NextRequest) {
  const { domain, fullPath } = parse(req);

  const hosting = await db.hosting.findFirst({
    where: {
      domain: {
        slug: domain,
      },
    },
    select: {
      protected: true,
      allowedEmailDomains: true,
      allowedEmails: true,
      namespaceId: true,
    },
  });

  // 404
  if (!hosting) {
    return NextResponse.error();
  }

  if (fullPath === "/login") {
    // if the domain is not protected and the path is /login, redirect to /
    if (!hosting.protected) return NextResponse.redirect(new URL("/", req.url));

    const session = await getMiddlewareSession(req);
    if (session) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.rewrite(new URL(`/${domain}${fullPath}`, req.url));
  }

  if (hosting.protected) {
    const session = await getMiddlewareSession(req);

    // if not session, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // if user is not allowed to access this domain, error
    const email = session.user.email;
    const emailDomain = email.split("@")[1] ?? "";
    const allowedEmailDomains = hosting.allowedEmailDomains;
    const allowedEmails = hosting.allowedEmails;

    if (
      !allowedEmails.includes(email) &&
      !allowedEmailDomains.includes(emailDomain)
    ) {
      // check if they're members
      const member = await db.member.findFirst({
        where: {
          userId: session.user.id,
          organization: {
            namespaces: {
              some: {
                id: hosting.namespaceId,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });

      // if they're not a member, rewrite to not-allowed
      if (!member) {
        return NextResponse.rewrite(new URL(`/${domain}/not-allowed`, req.url));
      }
    }
  }

  // rewrite to the custom domain
  return NextResponse.rewrite(new URL(`/${domain}${fullPath}`, req.url));
}
