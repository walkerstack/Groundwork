import { chunkArray } from "@/lib/functions";
import {
  qstashClient,
  qstashReceiver,
  triggerDocumentJob,
} from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";

import type { Document, IngestJob, Prisma } from "@agentset/db";
import { db, DocumentStatus, IngestJobStatus } from "@agentset/db";

const BATCH_SIZE = 30;

export const { POST } = serve<{
  jobId: IngestJob["id"];
}>(
  async (context) => {
    const { jobId } = context.requestPayload;

    const ingestionJob = await context.run("get-config", async () => {
      const ingestionJob = await db.ingestJob.findUnique({
        where: { id: jobId },
        include: { namespace: true },
      });

      if (!ingestionJob) {
        throw new Error("Ingestion job not found");
      }

      return ingestionJob;
    });

    await context.run("update-status-pre-processing", async () => {
      await db.ingestJob.update({
        where: { id: ingestionJob.id },
        data: {
          status: IngestJobStatus.PRE_PROCESSING,
          preProcessingAt: new Date(),
        },
        select: { id: true },
      });
    });

    const commonData = {
      status: DocumentStatus.QUEUED,
      tenantId: ingestionJob.tenantId,
      ingestJobId: ingestionJob.id,
      // metadata: ingestionJob.config?.metadata,
    } satisfies Partial<Prisma.DocumentCreateArgs["data"]>;

    let documents: Pick<Document, "id">[] = [];

    if (
      ingestionJob.payload.type === "FILE" ||
      ingestionJob.payload.type === "TEXT" ||
      ingestionJob.payload.type === "MANAGED_FILE"
    ) {
      documents = await context.run("create-documents", async () => {
        if (ingestionJob.payload.type === "TEXT") {
          const { text } = ingestionJob.payload;
          const document = await db.document.create({
            data: {
              ...commonData,
              name: ingestionJob.payload.name,
              source: {
                type: "TEXT",
                text,
              },
              totalCharacters: text.length,
            },
            select: { id: true },
          });

          return [document];
        }

        if (ingestionJob.payload.type === "FILE") {
          const { fileUrl } = ingestionJob.payload;
          const document = await db.document.create({
            data: {
              ...commonData,
              name: ingestionJob.payload.name,
              source: {
                type: "FILE",
                fileUrl: fileUrl,
              },
            },
            select: { id: true },
          });

          return [document];
        }

        if (ingestionJob.payload.type === "MANAGED_FILE") {
          const { key } = ingestionJob.payload;
          const document = await db.document.create({
            data: {
              ...commonData,
              name: ingestionJob.payload.name,
              source: {
                type: "MANAGED_FILE",
                key: key,
              },
            },
            select: { id: true },
          });

          return [document];
        }

        return [];
      });
    } else if (ingestionJob.payload.type === "URLS") {
      // we need to batch create the documents
      const batches = chunkArray(ingestionJob.payload.urls, 20);

      for (let i = 0; i < batches.length; i++) {
        const urlBatch = batches[i]!;
        const batchResult = await context.run(
          `create-documents-${i}`,
          async () => {
            const newDocuments = await db.document.createManyAndReturn({
              select: { id: true },
              data: urlBatch.map((url) => ({
                ...commonData,
                ingestJobId: ingestionJob.id,
                source: { type: "FILE", fileUrl: url },
              })),
            });

            return newDocuments.flat();
          },
        );

        documents = documents.concat(batchResult);
      }
    }

    const documentIdToWorkflowRunId = await context.run(
      "enqueue-documents",
      async () => {
        const documentIdToWorkflowRunId = await Promise.all(
          documents.map(async (document) => {
            const { workflowRunId } = await triggerDocumentJob({
              documentId: document.id,
            });

            return { documentId: document.id, workflowRunId };
          }),
        );

        return documentIdToWorkflowRunId;
      },
    );

    // update documents with workflowRunIds (in parallel)
    const batches = chunkArray(documentIdToWorkflowRunId, BATCH_SIZE);
    await Promise.all(
      batches.map((batch, i) =>
        context.run(`update-documents-with-workflowRunIds-${i}`, async () => {
          await db.$transaction(
            batch.map(({ documentId, workflowRunId }) =>
              db.document.update({
                where: { id: documentId },
                data: { workflowRunsIds: { push: workflowRunId } },
              }),
            ),
          );
        }),
      ),
    );

    await context.run("update-status-processing", async () => {
      await db.ingestJob.update({
        where: { id: ingestionJob.id },
        data: {
          status: IngestJobStatus.PROCESSING,
          processingAt: new Date(),
        },
        select: { id: true },
      });
    });
  },
  {
    failureFunction: async ({ context, failResponse }) => {
      const { jobId } = context.requestPayload;

      await db.ingestJob.update({
        where: { id: jobId },
        data: {
          status: IngestJobStatus.FAILED,
          error: failResponse || "Unknown error",
          failedAt: new Date(),
        },
        select: { id: true },
      });
    },
    qstashClient: qstashClient,
    receiver: qstashReceiver,
    flowControl: { key: "ingest-job", parallelism: 3, ratePerSecond: 3 },
  },
);
