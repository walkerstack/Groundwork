import type { PartitionResult } from "@/types/partition";
import { env } from "@/env";
import { makeChunk } from "@/lib/chunk";
import { getNamespaceEmbeddingModel } from "@/lib/embedding";
import { chunkArray } from "@/lib/functions";
import { getPartitionDocumentBody } from "@/lib/partition";
import { getNamespaceVectorStore } from "@/lib/vector-store";
import { qstashClient, qstashReceiver } from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";
import { embedMany } from "ai";

import { db, DocumentStatus, IngestJobStatus } from "@agentset/db";

const BATCH_SIZE = 5;

export const { POST } = serve<{
  documentId: string;
}>(
  async (context) => {
    const { documentId } = context.requestPayload;

    const {
      ingestJob: { namespace, ...ingestJob },
      ...document
    } = await context.run("get-config", async () => {
      const doc = await db.document.findUnique({
        where: { id: documentId },
        include: { ingestJob: { include: { namespace: true } } },
      });

      if (!doc) {
        throw new Error("Ingestion job not found");
      }

      return doc;
    });

    await context.run("update-status-pre-processing", async () => {
      await db.document.update({
        where: { id: document.id },
        data: {
          status: DocumentStatus.PRE_PROCESSING,
          preProcessingAt: new Date(),
        },
        select: { id: true },
      });
    });

    const formData = getPartitionDocumentBody(
      document,
      ingestJob,
      namespace.id,
    );
    const { body, status } = await context.call<PartitionResult>(
      "partition-document",
      {
        url: env.PARTITION_API_URL,
        method: "POST",
        headers: {
          "api-key": env.PARTITION_API_KEY,
        },
        body: formData,
      },
    );

    // const { status, body } = await context.run(
    //   "partition-document",
    //   async () => {
    //     const formData = getPartitionDocumentBody(
    //       document,
    //       ingestJob,
    //       namespace.id,
    //     );

    //     const response = await fetch(env.PARTITION_API_URL, {
    //       method: "POST",
    //       headers: {
    //         "api-key": env.PARTITION_API_KEY,
    //       },
    //       body: formData,
    //     });

    //     return {
    //       status: response.status,
    //       body: (await response.json()) as PartitionResult,
    //     };
    //   },
    // );

    if (status !== 200 || body.status !== 200) {
      throw new Error(
        "message" in body ? (body.message as string) : "Partition error",
        { cause: body },
      );
    }

    // change status to processing
    await context.run(
      "update-document-properties-and-status-processing",
      async () => {
        await db.document.update({
          where: { id: document.id },
          data: {
            status: DocumentStatus.PROCESSING,
            processingAt: new Date(),
            totalCharacters: body.total_characters,
            totalChunks: body.total_chunks,
            // TODO: return them from the partition api
            // totalPages: body.total_pages,
            // totalTokens: body.total_tokens,
            documentProperties: {
              fileSize: body.metadata.sizeInBytes,
              mimeType: body.metadata.filetype,
            },
          },
          select: { id: true },
        });
      },
    );

    const chunkBatches = await context.run("batch-chunks", () => {
      return chunkArray(body.chunks, BATCH_SIZE);
    });

    const [embeddingModel, vectorStore] = await Promise.all([
      getNamespaceEmbeddingModel(namespace),
      getNamespaceVectorStore(namespace, document.tenantId ?? undefined),
    ]);

    for (let batchIdx = 0; batchIdx < chunkBatches.length; batchIdx++) {
      const nodes = await context.run(`embed-batch-${batchIdx}`, async () => {
        const chunkBatch = chunkBatches[batchIdx]!;

        const results = await embedMany({
          model: embeddingModel,
          values: chunkBatch.map((chunk) => chunk.text),
        });

        return chunkBatch.map((chunk, idx) =>
          makeChunk({
            documentId: document.id,
            chunk,
            embedding: results.embeddings[idx]!,
          }),
        );
      });

      await context.run(`store-batch-${batchIdx}`, async () => {
        await vectorStore.upsert(nodes);
      });
    }

    await context.run("update-status-completed", async () => {
      await db.document.update({
        where: { id: document.id },
        data: {
          status: DocumentStatus.COMPLETED,
          completedAt: new Date(),
          error: null,
        },
        select: { id: true },
      });
    });

    await context.run("check-and-update-ingestion-job-status", async () => {
      const uncompletedDocument = await db.document.findFirst({
        where: {
          ingestJob: { id: ingestJob.id },
          status: { not: DocumentStatus.COMPLETED },
        },
        select: { id: true },
      });

      if (!uncompletedDocument) {
        await db.ingestJob.update({
          where: { id: ingestJob.id },
          data: {
            status: IngestJobStatus.COMPLETED,
            completedAt: new Date(),
            error: null,
          },
          select: { id: true },
        });
      }
    });
  },
  {
    failureFunction: async ({ context, failResponse }) => {
      const { documentId } = context.requestPayload;

      await db.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.FAILED,
          error: failResponse || "Unknown error",
          failedAt: new Date(),
          ingestJob: {
            update: {
              status: IngestJobStatus.FAILED,
              failedAt: new Date(),
              error: failResponse || "Unknown error",
            },
          },
        },
        select: { id: true },
      });
    },
    qstashClient: qstashClient,
    receiver: qstashReceiver,
    flowControl: { key: "process-document", parallelism: 3, ratePerSecond: 3 },
  },
);
