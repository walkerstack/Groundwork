import { triggerDeleteDocumentJob } from "@/lib/workflow";
import { z } from "zod";

import { db, DocumentStatus } from "@agentset/db";

export const deleteDocumentSchema = z.object({
  documentId: z.string(),
});

export const deleteDocument = async ({
  documentId,
}: z.infer<typeof deleteDocumentSchema>) => {
  const doc = await db.document.update({
    where: { id: documentId },
    data: {
      status: DocumentStatus.QUEUED_FOR_DELETE,
    },
    select: { id: true },
  });

  const { workflowRunId } = await triggerDeleteDocumentJob({
    documentId: doc.id,
  });

  const updatedDocument = await db.document.update({
    where: { id: doc.id },
    data: {
      workflowRunsIds: { push: workflowRunId },
    },
  });

  return updatedDocument;
};
