import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parse } from "@/lib/middleware/utils";

export default function CustomDomainMiddleware(req: NextRequest) {
  const { domain, fullPath } = parse(req);
  return NextResponse.rewrite(new URL(`/${domain}${fullPath}`, req.url));
}
