import { serve } from "@upstash/workflow/nextjs";
import { DocumentStatus } from "@prisma/client";
import { db } from "@/server/db";
import { getNamespaceVectorStore } from "@/lib/vector-store";
import { chunkArray } from "@/lib/functions";
import { cancelWorkflow, qstashClient, qstashReceiver } from "@/lib/workflow";

const BATCH_SIZE = 30;

export const { POST } = serve<{
  documentId: string;
  deleteJobWhenDone?: boolean;
}>(
  async (context) => {
    const currentWorkflowRunId = context.workflowRunId;
    const { documentId, deleteJobWhenDone } = context.requestPayload;

    const {
      ingestJob: { namespace, ...ingestJob },
      ...document
    } = await context.run("get-config", async () => {
      const doc = await db.document.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          tenantId: true,
          source: true,
          workflowRunsIds: true,
          ingestJob: { select: { id: true, namespace: true } },
        },
      });

      if (!doc) {
        throw new Error("Ingestion job not found");
      }

      return doc;
    });

    await context.run("update-status-deleting", async () => {
      await db.document.update({
        where: { id: document.id },
        data: {
          status: DocumentStatus.DELETING,
        },
        select: { id: true },
      });
    });

    await context.run("cancel-document-workflows", async () => {
      const idsToCancel = document.workflowRunsIds.filter(
        (id) => id !== currentWorkflowRunId,
      );

      if (idsToCancel.length > 0) {
        await cancelWorkflow({ ids: idsToCancel });
      }
    });

    // TODO: delete files if they exist (document.source)
    const vectorStore = await getNamespaceVectorStore(
      namespace,
      document.tenantId ?? undefined,
    );

    const chunkIdsToDelete = await context.run("get-chunk-ids", async () => {
      let paginationToken: string | undefined;
      const chunkIds: string[] = [];

      do {
        const chunks = await vectorStore.list({
          prefix: `${document.id}#`,
          paginationToken,
        });

        chunks.vectors?.forEach((chunk) => {
          if (chunk.id) {
            chunkIds.push(chunk.id);
          }
        });

        paginationToken = chunks.pagination?.next;
      } while (paginationToken);

      return chunkIds;
    });

    await context.run("delete-vector-store-chunks", async () => {
      const batches = chunkArray(chunkIdsToDelete, BATCH_SIZE);
      for (const batch of batches) {
        await vectorStore.delete(batch);
      }
    });

    await context.run("delete-document", async () => {
      await db.document.delete({
        where: { id: document.id },
        select: { id: true },
      });
    });

    await context.run("check-and-delete-ingest-job", async () => {
      if (deleteJobWhenDone) {
        const document = await db.document.findFirst({
          where: { ingestJobId: ingestJob.id },
        });

        if (!document) {
          // TODO: delete payload
          await db.ingestJob.delete({
            where: { id: ingestJob.id },
          });
        }
      }
    });
  },
  {
    qstashClient: qstashClient,
    receiver: qstashReceiver,
    flowControl: { key: "delete-document", parallelism: 3, ratePerSecond: 3 },
  },
);
