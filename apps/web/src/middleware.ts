import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const redirectLogin = (request: NextRequest) =>
  NextResponse.redirect(new URL("/login", request.url));

const redirectDashboard = (request: NextRequest) =>
  NextResponse.redirect(new URL("/dashboard", request.url));

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/ (proxies for third-party services)
     * 4. Metadata files: favicon.ico, sitemap.xml, robots.txt, manifest.webmanifest
     */
    "/((?!api/|_next/|_proxy/|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest).*)",
  ],
};

export function middleware(request: NextRequest) {
  const cookies = getSessionCookie(request);
  const pathname = request.nextUrl.pathname;
  const domain = request.nextUrl.hostname;

  // rewrite to /api
  // if (domain === "api.agentset.ai") {
  const searchParams = request.nextUrl.searchParams.toString();
  const searchParamsString = searchParams.length > 0 ? `?${searchParams}` : "";
  const fullPath = `${pathname}${searchParamsString}`;

  return NextResponse.rewrite(new URL(`/api${fullPath}`, request.url));
  // }

  // if the user is not logged in, and is trying to access a dashboard page, redirect to login
  if (!cookies && (pathname.startsWith("/dashboard") || pathname === "/")) {
    return redirectLogin(request);
  }

  // if the user is logged in, and is trying to access the login page, redirect to dashboard
  if (cookies && (pathname.startsWith("/login") || pathname === "/")) {
    return redirectDashboard(request);
  }

  return NextResponse.next();
}
