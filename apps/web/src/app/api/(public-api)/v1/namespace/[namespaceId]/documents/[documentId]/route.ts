import { AgentsetApiError } from "@/lib/api/errors";
import { withNamespaceApiHandler } from "@/lib/api/handler";
import { makeApiSuccessResponse } from "@/lib/api/response";
import {
  deleteDocument,
  deleteDocumentSchema,
} from "@/services/documents/delete";
import { getDocument, getDocumentSchema } from "@/services/documents/get";

import { db } from "@agentset/db";

export const GET = withNamespaceApiHandler(
  async ({ params, namespace, headers }) => {
    const documentId = params.documentId as string;

    const validatedBody = await getDocumentSchema.parseAsync({
      documentId,
    });

    const data = await getDocument({
      ...validatedBody,
      namespaceId: namespace.id,
    });

    return makeApiSuccessResponse({
      data,
      headers,
    });
  },
);

export const DELETE = withNamespaceApiHandler(
  async ({ params, namespace, headers }) => {
    const documentId = params.documentId as string;
    const validatedBody = await deleteDocumentSchema.parseAsync({
      documentId,
    });

    // TODO: check apiScope

    const document = await db.document.findUnique({
      where: {
        id: validatedBody.documentId,
        ingestJob: {
          namespaceId: namespace.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!document)
      throw new AgentsetApiError({
        code: "not_found",
        message: "Document not found",
      });

    const data = await deleteDocument(validatedBody);

    return makeApiSuccessResponse({
      data,
      headers,
    });
  },
);
