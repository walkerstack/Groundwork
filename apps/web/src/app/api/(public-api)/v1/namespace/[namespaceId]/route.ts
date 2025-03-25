import { withNamespaceApiHandler } from "@/lib/api/handler";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { deleteNamespace } from "@/services/namespaces/delete";

export const GET = withNamespaceApiHandler(async ({ namespace, headers }) => {
  return makeApiSuccessResponse({
    data: namespace,
    headers,
  });
});

export const DELETE = withNamespaceApiHandler(
  async ({ namespace, headers }) => {
    // TODO: check apiScope
    await deleteNamespace({ namespaceId: namespace.id });

    return makeApiSuccessResponse({
      data: namespace,
      headers,
    });
  },
);
