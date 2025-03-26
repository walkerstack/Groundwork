import { chunkArray } from "@/lib/functions";
import {
  cancelWorkflow,
  qstashClient,
  qstashReceiver,
  triggerDeleteDocumentJob,
} from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";

import { db, DocumentStatus, IngestJobStatus } from "@agentset/db";

const BATCH_SIZE = 30;

export const { POST } = serve<{
  jobId: string;
  deleteNamespaceWhenDone?: boolean;
}>(
  async (context) => {
    const shouldDeleteNamespace = await context.run(
      "should-delete-namespace",
      () => {
        return context.requestPayload.deleteNamespaceWhenDone ?? false;
      },
    );

    const { namespace, ...ingestJob } = await context.run(
      "get-config",
      async () => {
        const { jobId } = context.requestPayload;
        const job = await db.ingestJob.findUnique({
          where: { id: jobId },
          select: {
            id: true,
            tenantId: true,
            payload: true,
            workflowRunsIds: true,
            namespace: { select: { id: true } },
          },
        });

        if (!job) {
          throw new Error("Ingestion job not found");
        }

        return job;
      },
    );

    await context.run("update-status-deleting", async () => {
      await db.ingestJob.update({
        where: { id: ingestJob.id },
        data: {
          status: IngestJobStatus.DELETING,
        },
        select: { id: true },
      });
    });

    await context.run("cancel-ingest-job-workflows", async () => {
      const currentWorkflowRunId = context.workflowRunId;
      const idsToCancel = ingestJob.workflowRunsIds.filter(
        (id) => id !== currentWorkflowRunId,
      );

      if (idsToCancel.length > 0) {
        await cancelWorkflow({ ids: idsToCancel });
      }
    });

    // TODO: delete files if they exist (ingestJob.payload.source)

    const documents = await context.run("get-documents", async () => {
      const documents = await db.document.findMany({
        where: { ingestJobId: ingestJob.id },
        select: { id: true },
      });

      return documents;
    });

    // enqueue delete documents in parallel
    if (documents.length > 0) {
      const batches = chunkArray(documents, BATCH_SIZE);
      await Promise.all(
        batches.map((batch, i) =>
          context.run(`enqueue-delete-documents-${i}`, async () => {
            await db.document.updateMany({
              where: { id: { in: batch.map((d) => d.id) } },
              data: { status: DocumentStatus.DELETING },
            });

            const docIdToWorkflowRunId = (
              await Promise.all(
                batch.map(async (document) => {
                  const { workflowRunId } = await triggerDeleteDocumentJob({
                    documentId: document.id,
                    deleteJobWhenDone: true,
                  });

                  return { documentId: document.id, workflowRunId };
                }),
              )
            ).reduce(
              (acc, curr) => {
                acc[curr.documentId] = curr.workflowRunId;
                return acc;
              },
              {} as Record<string, string>,
            );

            // update documents with workflowRunIds
            await db.$transaction(
              batch.map((document) =>
                db.document.update({
                  where: { id: document.id },
                  data: {
                    workflowRunsIds: {
                      push: docIdToWorkflowRunId[document.id],
                    },
                  },
                }),
              ),
            );

            return Object.values(docIdToWorkflowRunId);
          }),
        ),
      );
    } else {
      await context.run("delete-ingest-job", async () => {
        await db.ingestJob.delete({
          where: { id: ingestJob.id },
        });
      });
    }

    if (shouldDeleteNamespace) {
      await context.run("check-and-delete-namespace", async () => {
        const job = await db.ingestJob.findFirst({
          where: { namespaceId: namespace.id },
        });

        if (!job) {
          await db.namespace.delete({ where: { id: namespace.id } });
          return true;
        }

        return false;
      });
    }
  },
  {
    qstashClient: qstashClient,
    receiver: qstashReceiver,
    flowControl: { key: "delete-ingest-job", parallelism: 3, ratePerSecond: 3 },
  },
);
