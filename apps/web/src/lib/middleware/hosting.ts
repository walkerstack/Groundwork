import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parse } from "@/lib/middleware/utils";

import type { Prisma } from "@agentset/db";
import { db } from "@agentset/db";

import { HOSTING_PREFIX } from "../constants";
import { getMiddlewareSession } from "./get-session";

export default async function HostingMiddleware(
  req: NextRequest,
  mode: "domain" | "path" = "domain",
) {
  const { domain, path, fullPath: _fullPath } = parse(req);

  let filter: Prisma.HostingWhereInput = {};
  let fullPath = _fullPath;
  if (mode === "domain") {
    filter = {
      domain: {
        slug: domain,
      },
    };
  } else {
    // fullPath will looks like this: /a/my-slug/...
    // we need to get the slug and the rest of the path
    const slug = path.replace(HOSTING_PREFIX, "").split("/")[0];
    fullPath = fullPath.replace(`${HOSTING_PREFIX}${slug}`, "");
    if (fullPath === "") fullPath = "/";

    filter = {
      slug,
    };
  }

  const hosting = await db.hosting.findFirst({
    where: filter,
    select: {
      id: true,
      slug: true,
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
    const homeUrl = new URL(
      mode === "domain" ? "/" : `${HOSTING_PREFIX}${hosting.slug}`,
      req.url,
    );

    // if the domain is not protected and the path is /login, redirect to /
    if (!hosting.protected) return NextResponse.redirect(homeUrl);

    const session = await getMiddlewareSession(req);
    if (session) {
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.rewrite(new URL(`/${hosting.id}${fullPath}`, req.url));
  }

  if (hosting.protected) {
    const session = await getMiddlewareSession(req);

    // if not session, redirect to login
    if (!session) {
      const loginUrl = new URL(
        `/login${mode === "path" ? `?r=${encodeURIComponent(`${HOSTING_PREFIX}${hosting.slug}`)}` : ""}`,
        req.url,
      );
      return NextResponse.redirect(loginUrl);
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
        return NextResponse.rewrite(
          new URL(`/${hosting.id}/not-allowed`, req.url),
        );
      }
    }
  }

  // rewrite to the custom domain
  return NextResponse.rewrite(new URL(`/${hosting.id}${fullPath}`, req.url));
}
