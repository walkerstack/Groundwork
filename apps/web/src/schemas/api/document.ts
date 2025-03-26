import z from "@/lib/zod";

import { DocumentStatus } from "@agentset/db";

import {
  filePayloadSchema,
  managedFilePayloadSchema,
  textPayloadSchema,
} from "./ingest-job";
import { paginationSchema } from "./pagination";

const nameSchema = z
  .string()
  .nullable()
  .default(null)
  .describe("The name of the document.");

export const documentSourceSchema = z
  .discriminatedUnion("type", [
    textPayloadSchema.omit({ name: true }),
    filePayloadSchema.omit({ name: true }),
    managedFilePayloadSchema.omit({ name: true }),
  ])
  .describe("The source of the document.");

const documentPropertiesSchema = z
  .object({
    fileSize: z.number().describe("The size of the file in bytes."),
    mimeType: z
      .string()
      .nullable()
      .default(null)
      .describe("The MIME type of the file."),
  })
  .describe("The properties of the document.");

export const DocumentStatusSchema = z
  .nativeEnum(DocumentStatus)
  .describe("The status of the document.");

export const DocumentSchema = z
  .object({
    id: z.string().describe("The unique ID of the document."),
    ingestJobId: z.string().describe("The ingest job ID of the document."),
    externalId: z
      .string()
      .nullable()
      .default(null)
      .describe("A unique external ID."),
    name: nameSchema,
    tenantId: z
      .string()
      .nullable()
      .default(null)
      .describe("The tenant ID of the ingest job."),
    status: DocumentStatusSchema,
    error: z
      .string()
      .nullable()
      .default(null)
      .describe(
        "The error message of the document. Only exists when the status is failed.",
      ),
    source: documentSourceSchema,
    properties: documentPropertiesSchema.nullable().default(null),
    totalChunks: z.number().describe("The total number of chunks."),
    totalTokens: z.number().describe("The total number of tokens."),
    totalCharacters: z.number().describe("The total number of characters."),
    totalPages: z
      .number()
      .describe(
        "The total number of pages. Will be 0 if the document is not paged (e.g. PDF).",
      ),
    createdAt: z.date().describe("The date and time the document was created."),
    queuedAt: z
      .date()
      .nullable()
      .describe("The date and time the document was queued.")
      .default(null),
    preProcessingAt: z
      .date()
      .nullable()
      .describe("The date and time the document was pre-processed.")
      .default(null),
    processingAt: z
      .date()
      .nullable()
      .describe("The date and time the document was processed.")
      .default(null),
    completedAt: z
      .date()
      .nullable()
      .describe("The date and time the document was completed.")
      .default(null),
    failedAt: z
      .date()
      .nullable()
      .describe("The date and time the document failed.")
      .default(null),
  })
  .openapi({
    title: "Document",
  });

export const DocumentsQuerySchema = z.object({
  statuses: z
    .array(DocumentStatusSchema)
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
    .describe("The order to sort by. Default is `desc`."),
});

export const getDocumentsSchema = DocumentsQuerySchema.merge(paginationSchema);
