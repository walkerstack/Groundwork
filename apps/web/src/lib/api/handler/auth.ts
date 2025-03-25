import type { Session } from "@/lib/auth-types";
import type { NextRequest } from "next/server";

import type { Namespace } from "@agentset/db";

import type { HandlerParams } from "./base";
import { AgentsetApiError, handleAndReturnErrorResponse } from "../errors";
import { authenticateRequestSession } from "../session";
import { getTenantFromRequest } from "../tenant";
import { getSearchParams } from "../utils";

interface AuthHandler {
  (
    params: Omit<HandlerParams, "organization" | "apiScope"> & {
      session: Session;
      namespace: Namespace;
    },
  ): Promise<Response>;
}

export const withAuthApiHandler = (
  handler: AuthHandler,
  { requireNamespace = true }: { requireNamespace?: boolean } = {},
) => {
  return async (
    req: NextRequest,
    { params }: { params: Promise<Record<string, string> | undefined> },
  ) => {
    const routeParams = await params;
    const searchParams = getSearchParams(req.url);

    const namespaceId = searchParams.namespaceId;
    const headers = {};

    try {
      if (requireNamespace && !namespaceId) {
        throw new AgentsetApiError({
          code: "bad_request",
          message: "Namespace ID is required",
        });
      }

      const tenantId = getTenantFromRequest(req);
      const { namespace, session } = await authenticateRequestSession(
        req,
        namespaceId,
      );

      return await handler({
        req,
        params: routeParams ?? {},
        searchParams,
        namespace,
        session,
        tenantId,
      });
    } catch (error) {
      console.error(error);
      return handleAndReturnErrorResponse(error, headers);
    }
  };
};
