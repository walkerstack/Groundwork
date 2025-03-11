import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const cookies = getSessionCookie(request);

  // if (request.nextUrl.pathname.startsWith("/login")) {
  //   if (cookies) {
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }

  //   return NextResponse.next();
  // }

  if (!cookies) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/login"],
};
