import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parse } from "@/lib/middleware/utils";
import { getSessionCookie } from "better-auth/cookies";

export default function AppMiddleware(req: NextRequest) {
  const { path, fullPath } = parse(req);

  const cookies = getSessionCookie(req);

  // if the user is logged in, and is trying to access the login page, redirect to dashboard
  if (cookies && path.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // if the user is not logged in, and is trying to access a dashboard page, redirect to login
  if (
    !cookies &&
    !(path.startsWith("/login") || path.startsWith("/invitation"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // otherwise, rewrite the path to /app
  return NextResponse.rewrite(new URL(`/app.agentset.ai${fullPath}`, req.url));
}
