import z from "@/lib/zod";

import { IngestJobStatus } from "@agentset/db";

import { paginationSchema } from "./pagination";

const nameSchema = z
  .string()
  .nullable()
  .default(null)
  .describe("The name of the ingest job.");

export const textPayloadSchema = z.object({
  type: z.literal("TEXT"),
  text: z.string().describe("The text to ingest."),
  name: nameSchema,
});

export const filePayloadSchema = z.object({
  type: z.literal("FILE"),
  fileUrl: z.string().describe("The URL of the file to ingest."),
  name: nameSchema,
});

export const managedFilePayloadSchema = z.object({
  type: z.literal("MANAGED_FILE"),
  key: z.string().describe("The key of the managed file to ingest."),
  name: nameSchema,
});

export const urlsPayloadSchema = z.object({
  type: z.literal("URLS"),
  urls: z.array(z.string().url()).describe("The URLs to ingest."),
});

export const ingestJobPayloadSchema = z
  .discriminatedUnion("type", [
    textPayloadSchema,
    filePayloadSchema,
    managedFilePayloadSchema,
    urlsPayloadSchema,
  ])
  .describe("The ingest job payload.");

export const configSchema = z
  .object({
    chunkSize: z.number().optional().describe("Custom chunk size."),
    chunkOverlap: z.number().optional().describe("Custom chunk overlap."),
    metadata: z
      .record(z.string(), z.unknown())
      .optional()
      .describe("Custom metadata to be added to the ingested documents."),
  })
  .describe("The ingest job config.");

export const IngestJobStatusSchema = z
  .nativeEnum(IngestJobStatus)
  .describe("The status of the ingest job.");

export const IngestJobSchema = z
  .object({
    id: z.string().describe("The unique ID of the ingest job."),
    namespaceId: z.string().describe("The namespace ID of the ingest job."),
    tenantId: z
      .string()
      .nullable()
      .default(null)
      .describe("The tenant ID of the ingest job."),
    status: IngestJobStatusSchema,
    error: z
      .string()
      .nullable()
      .default(null)
      .describe(
        "The error message of the ingest job. Only exists when the status is failed.",
      ),
    payload: ingestJobPayloadSchema,
    config: configSchema.nullable().default(null),
    createdAt: z
      .date()
      .describe("The date and time the namespace was created."),
    queuedAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job was queued.")
      .default(null),
    preProcessingAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job was pre-processed.")
      .default(null),
    processingAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job was processed.")
      .default(null),
    completedAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job was completed.")
      .default(null),
    failedAt: z
      .date()
      .nullable()
      .describe("The date and time the ingest job failed.")
      .default(null),
  })
  .openapi({
    title: "Ingest Job",
  });

export const IngestJobsQuerySchema = z.object({
  statuses: z
    .array(IngestJobStatusSchema)
    .optional()
    .describe("Statuses to filter by."),
  orderBy: z
    .enum(["createdAt"])
    .optional()
    .default("createdAt")
    .describe("The field to order by. Default is `createdAt`."),
  order: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc")
    .describe("The sort order. Default is `desc`."),
});

export const getIngestionJobsSchema =
  IngestJobsQuerySchema.merge(paginationSchema);

export const createIngestJobSchema = z.object({
  payload: ingestJobPayloadSchema,
  config: configSchema.optional(),
});
