import { triggerDeleteDocumentJob } from "@/lib/workflow";

import { db, DocumentStatus } from "@agentset/db";

export const deleteDocument = async ({
  documentId,
  userId,
}: {
  documentId: string;
  userId?: string;
}) => {
  const document = await db.document.findUnique({
    where: {
      id: documentId,
      ...(userId
        ? {
            ingestJob: {
              namespace: {
                organization: {
                  members: {
                    some: { userId, role: { in: ["admin", "owner"] } },
                  },
                },
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  if (!document) return null;

  await db.document.update({
    where: { id: documentId },
    data: {
      status: DocumentStatus.QUEUED_FOR_DELETE,
    },
    select: { id: true },
  });

  const { workflowRunId } = await triggerDeleteDocumentJob({ documentId });
  await db.document.update({
    where: { id: documentId },
    data: {
      workflowRunsIds: { push: workflowRunId },
    },
    select: { id: true },
  });

  return document;
};
