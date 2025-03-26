import { triggerDeleteDocumentJob } from "@/lib/workflow";

import { db, DocumentStatus } from "@agentset/db";

export const deleteDocument = async (documentId: string) => {
  const updatedDoc = await db.document.update({
    where: { id: documentId },
    data: {
      status: DocumentStatus.QUEUED_FOR_DELETE,
    },
  });

  const { workflowRunId } = await triggerDeleteDocumentJob({
    documentId: updatedDoc.id,
  });

  await db.document.update({
    where: { id: updatedDoc.id },
    data: {
      workflowRunsIds: { push: workflowRunId },
    },
  });

  return updatedDoc;
};
