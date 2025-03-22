import type { NextRequest } from "next/server";

export const getTenantFromRequest = (request: NextRequest) => {
  const tenantId = request.headers.get("x-tenant-id");
  return tenantId?.trim() ?? undefined;
};
