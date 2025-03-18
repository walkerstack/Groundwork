import { serve } from "@upstash/workflow/nextjs";

import {
  DocumentStatus,
  IngestJobStatus,
  type Prisma,
  type IngestJob,
} from "@prisma/client";
import { db } from "@/server/db";
import {
  qstashClient,
  qstashReceiver,
  triggerDocumentJob,
} from "@/lib/workflow";
import { chunkArray } from "@/lib/functions";

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

    const documents = await context.run("create-documents", async () => {
      const commonData = {
        status: DocumentStatus.QUEUED,
        tenantId: ingestionJob.tenantId,
        ingestJob: { connect: { id: ingestionJob.id } },
        // metadata: ingestionJob.config?.metadata,
      } satisfies Partial<Prisma.DocumentCreateInput>;

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
              name: ingestionJob.payload.name,
              type: "FILE",
              fileUrl: fileUrl,
            },
          },
        });

        return [document];
      }

      return [];
    });

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
