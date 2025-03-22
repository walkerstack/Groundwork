import { z } from "zod";

import { db } from "@agentset/db";

export const getDocumentSchema = z.object({
  documentId: z.string(),
});

export const getDocument = async (
  body: z.infer<typeof getDocumentSchema> & {
    namespaceId?: string;
  },
) => {
  const doc = await db.document.findUnique({
    where: {
      id: body.documentId,
      ...(body.namespaceId && {
        ingestJob: {
          namespaceId: body.namespaceId,
        },
      }),
    },
  });

  return doc;
};
