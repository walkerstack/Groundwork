import { db } from "@agentset/db";

import type { AuthenticatedRequest } from "../api-utils/auth";

export const canDeleteDocument = async (
  documentId: string,
  req: AuthenticatedRequest,
) => {
  const document = await db.document.findUnique({
    where: {
      id: documentId,
      ingestJob: {
        namespace: {
          organization: {
            id: req.data.organizationId,
          },
        },
      },
    },
  });

  return !!document;
};
