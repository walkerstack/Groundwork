import { chunkArray } from "@/lib/functions";
import { deleteObject } from "@/lib/s3";
import { getNamespaceVectorStore } from "@/lib/vector-store";
import { cancelWorkflow, qstashClient, qstashReceiver } from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";

import { db, DocumentStatus } from "@agentset/db";

const BATCH_SIZE = 30;

export const { POST } = serve<{
  documentId: string;
  deleteJobWhenDone?: boolean;
}>(
  async (context) => {
    const {
      ingestJob: { namespace, ...ingestJob },
      ...document
    } = await context.run("get-config", async () => {
      const { documentId } = context.requestPayload;
      const doc = await db.document.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          tenantId: true,
          source: true,
          workflowRunsIds: true,
          totalPages: true,
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
      const currentWorkflowRunId = context.workflowRunId;
      const idsToCancel = document.workflowRunsIds.filter(
        (id) => id !== currentWorkflowRunId,
      );

      if (idsToCancel.length > 0) {
        await cancelWorkflow({ ids: idsToCancel });
      }
    });

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
      await db.$transaction([
        db.document.delete({
          where: { id: document.id },
          select: { id: true },
        }),
        db.organization.update({
          where: { id: namespace.organizationId },
          data: {
            totalDocuments: { decrement: 1 },
            totalPages: { decrement: document.totalPages },
          },
        }),
      ]);
    });

    await context.run("check-and-delete-managed-file", async () => {
      if (document.source.type === "MANAGED_FILE") {
        await deleteObject(document.source.key);
      }
    });

    await context.run("check-and-delete-ingest-job", async () => {
      const { deleteJobWhenDone } = context.requestPayload;

      if (deleteJobWhenDone) {
        const document = await db.document.findFirst({
          where: { ingestJobId: ingestJob.id },
        });

        if (!document) {
          // TODO: delete payload
          await db.ingestJob
            .delete({
              where: { id: ingestJob.id },
              select: { id: true },
            })
            .catch((e) => {
              if (e.code === "P2025") {
                return null; // already deleted
              }

              throw e;
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
