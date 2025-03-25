import { withNamespaceApiHandler } from "@/lib/api/handler";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { deleteNamespace } from "@/services/namespaces/delete";

export const GET = withNamespaceApiHandler(async ({ namespace }) => {
  return makeApiSuccessResponse({
    data: namespace,
  });
});

export const DELETE = withNamespaceApiHandler(async ({ namespace }) => {
  // TODO: check apiScope
  await deleteNamespace({ namespaceId: namespace.id });

  return makeApiSuccessResponse({
    data: namespace,
  });
});
