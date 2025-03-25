import { supabase } from "@/lib/supabase";

import type { Namespace } from "@agentset/db";

import type { HandlerParams } from "./base";
import { AgentsetApiError } from "../errors";
import { withApiHandler } from "./base";

interface NamespaceHandler {
  (
    params: HandlerParams & {
      namespace: Namespace;
    },
  ): Promise<Response>;
}

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
