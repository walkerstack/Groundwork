import type { TriggerDocumentJobBody } from "@/lib/workflow";
import type { PartitionBatch, PartitionResult } from "@/types/partition";
import { env } from "@/env";
import { makeChunk } from "@/lib/chunk";
import { getNamespaceEmbeddingModel } from "@/lib/embedding";
import { chunkArray } from "@/lib/functions";
import { getPartitionDocumentBody } from "@/lib/partition";
import { redis } from "@/lib/redis";
import { getNamespaceVectorStore } from "@/lib/vector-store";
import { qstashClient, qstashReceiver } from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";
import { embedMany } from "ai";

import { db, DocumentStatus, IngestJobStatus } from "@agentset/db";

export const { POST } = serve<TriggerDocumentJobBody>(
  async (context) => {
    const {
      ingestJob: { namespace, ...ingestJob },
      ...document
    } = await context.run("get-config", async () => {
      const { documentId } = context.requestPayload;
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

    const partitionBody = await context.run(
      "get-partition-document-body",
      async () => {
        return await getPartitionDocumentBody(document, ingestJob, namespace);
      },
    );

    const { body, status } = await context.call<PartitionResult>(
      "partition-document",
      {
        url: env.PARTITION_API_URL,
        method: "POST",
        headers: {
          "api-key": env.PARTITION_API_KEY,
        },
        body: partitionBody,
      },
    );

    if (status !== 200 || body.status !== 200) {
      throw new Error(
        !!body && typeof body === "object" && "message" in body
          ? (body.message as string)
          : "Partition error",
        { cause: body },
      );
    }

    // change status to processing
    const { totalPages } = await context.run(
      "update-document-properties-and-status-processing",
      async () => {
        const totalPages =
          body.total_pages && typeof body.total_pages === "number"
            ? body.total_pages
            : body.total_characters / 1000;

        await db.document.update({
          where: { id: document.id },
          data: {
            status: DocumentStatus.PROCESSING,
            processingAt: new Date(),
            totalCharacters: body.total_characters,
            totalChunks: body.total_chunks,
            totalPages,
            // totalTokens: body.total_tokens,
            documentProperties: {
              fileSize: body.metadata.sizeInBytes,
              mimeType: body.metadata.filetype,
            },
          },
          select: { id: true },
        });

        return { totalPages };
      },
    );

    const [embeddingModel, vectorStore] = await Promise.all([
      getNamespaceEmbeddingModel(namespace, "document"),
      getNamespaceVectorStore(namespace, document.tenantId ?? undefined),
    ]);

    let totalTokens = 0;
    for (let batchIdx = 0; batchIdx < body.total_batches; batchIdx++) {
      const tokens = await context.run(`embed-batch-${batchIdx}`, async () => {
        const chunkBatch = await redis.get<PartitionBatch>(
          body.batch_template.replace("[BATCH_INDEX]", batchIdx.toString()),
        );

        if (!chunkBatch) {
          throw new Error("Chunk batch not found");
        }

        const results = await embedMany({
          model: embeddingModel,
          values: chunkBatch.map((chunk) => chunk.text),
        });

        const nodes = chunkBatch.map((chunk, idx) =>
          makeChunk({
            documentId: document.id,
            chunk,
            embedding: results.embeddings[idx]!,
          }),
        );

        await vectorStore.upsert(nodes);

        return results.usage.tokens;
      });

      totalTokens += tokens;
    }

    await context.run("update-status-completed", async () => {
      await db.$transaction([
        db.document.update({
          where: { id: document.id },
          data: {
            status: DocumentStatus.COMPLETED,
            totalTokens,
            completedAt: new Date(),
            error: null,
          },
          select: { id: true },
        }),
        // update namespace + organization total pages
        db.namespace.update({
          where: { id: namespace.id },
          data: {
            totalPages: { increment: totalPages },
            organization: {
              update: {
                totalPages: { increment: totalPages },
              },
            },
          },
          select: { id: true },
        }),
      ]);
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

    // delete all chunks from redis
    await context.run("delete-chunks-from-redis", async () => {
      const keys = new Array(body.total_batches)
        .fill(null)
        .map((_, idx) =>
          body.batch_template.replace("[BATCH_INDEX]", idx.toString()),
        );

      const keyBatches = chunkArray(keys, 150);
      for (const keyBatch of keyBatches) {
        await redis.del(...keyBatch);
      }
    });
  },
  {
    failureFunction: async ({ context, failResponse }) => {
      if (context.requestPayload && context.requestPayload.documentId) {
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
      }
    },
    qstashClient: qstashClient,
    receiver: qstashReceiver,
    flowControl: { key: "process-document", parallelism: 3, ratePerSecond: 3 },
  },
);
