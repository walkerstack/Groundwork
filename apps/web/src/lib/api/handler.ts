import type { NextRequest } from "next/server";
import {
  AgentsetApiError,
  handleAndReturnErrorResponse,
} from "@/lib/api/errors";

import type { Namespace, Organization } from "@agentset/db";

import type { Session } from "../auth-types";
import { tryCatch } from "../error";
import { supabase } from "../supabase";
import { getApiKeyInfo } from "./api-key";
import { authenticateRequestSession } from "./session";
import { getTenantFromRequest } from "./tenant";
import { getSearchParams } from "./utils";

interface HandlerParams {
  req: NextRequest;
  params: Record<string, string>;
  searchParams: Record<string, string>;
  organization: Pick<Organization, "id">;
  apiScope: string;
  tenantId?: string;
}

interface Handler {
  (params: HandlerParams): Promise<Response>;
}

interface AuthHandler {
  (
    params: Omit<HandlerParams, "organization" | "apiScope"> & {
      session: Session;
      namespace: Namespace;
    },
  ): Promise<Response>;
}

interface NamespaceHandler {
  (
    params: HandlerParams & {
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

export const withApiHandler = (handler: Handler) => {
  return async (
    req: NextRequest,
    { params }: { params: Promise<Record<string, string> | undefined> },
  ) => {
    const routeParams = await params;
    const searchParams = getSearchParams(req.url);

    let apiKey: string | undefined = undefined;
    const headers = {};

    try {
      const authorizationHeader = req.headers.get("Authorization");
      if (authorizationHeader) {
        if (!authorizationHeader.includes("Bearer ")) {
          throw new AgentsetApiError({
            code: "bad_request",
            message:
              "Misconfigured authorization header. Did you forget to add 'Bearer '?",
          });
        }
        apiKey = authorizationHeader.replace("Bearer ", "");
      }

      if (!apiKey) {
        throw new AgentsetApiError({
          code: "unauthorized",
          message: "Unauthorized: Invalid API key.",
        });
      }

      const orgApiKey = await tryCatch(getApiKeyInfo(apiKey));
      if (!orgApiKey.data) {
        throw new AgentsetApiError({
          code: "unauthorized",
          message: "Unauthorized: Invalid API key.",
        });
      }

      const tenantId = getTenantFromRequest(req);

      return await handler({
        req,
        params: routeParams ?? {},
        searchParams,
        organization: { id: orgApiKey.data.organizationId },
        apiScope: orgApiKey.data.scope,
        tenantId,
      });
    } catch (error) {
      console.error(error);
      return handleAndReturnErrorResponse(error, headers);
    }
  };
};

export const withNamespaceApiHandler = (handler: NamespaceHandler) => {
  return withApiHandler(async (params) => {
    const namespaceId = params.params.namespaceId!;
    const result = await supabase
      .from("namespace")
      .select("*")
      .eq("id", namespaceId)
      .single();

    if (!result.data || result.data.organizationId !== params.organization.id) {
      throw new AgentsetApiError({
        code: "unauthorized",
        message: "Unauthorized: You don't have access to this namespace.",
      });
    }

    const namespace = result.data as unknown as Namespace;

    return await handler({
      ...params,
      namespace,
    });
  });
};
