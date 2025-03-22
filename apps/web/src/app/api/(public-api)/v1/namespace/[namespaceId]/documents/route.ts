import { makeApiSuccessResponse } from "@/lib/api-utils/response";
import { withNamespaceApiHandler } from "@/lib/api/handler";
import {
  getAllDocuments,
  getAllDocumentsSchema,
} from "@/services/documents/all";

export const GET = withNamespaceApiHandler(
  async ({ searchParams, namespace, tenantId }) => {
    const validatedParams =
      await getAllDocumentsSchema.parseAsync(searchParams);

    const data = await getAllDocuments({
      ...validatedParams,
      namespaceId: namespace.id,
      tenantId,
    });

    return makeApiSuccessResponse({
      data,
    });
  },
);
