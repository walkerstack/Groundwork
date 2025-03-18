import type { Document, IngestJob } from "@prisma/client";

type PartitionBody = {
  // one of url or text is required
  url?: string;
  text?: string;

  filename: string;
  extra_metadata?: Record<string, unknown>;
  unstructured_args?: {
    overlap?: number;
    overlap_all?: boolean; // if true, overlap is applied to all chunks
    max_characters?: number; // hard chunk size
    new_after_n_chars?: number; // soft chunk size
    chunking_strategy?: "basic" | "by_title";
    strategy?: "auto" | "fast" | "hi_res" | "ocr_only";
    languages?: string[];
  };
};

export const getPartitionDocumentBody = (
  document: Document,
  ingestJob: IngestJob,
  namespaceId: string,
) => {
  const body: Partial<PartitionBody> = {};

  if (document.source.type === "TEXT") {
    body.text = document.source.text;
    body.filename = document.name || `${document.id}.txt`;
  } else if (document.source.type === "FILE") {
    body.url = document.source.fileUrl;
    body.filename = document.name || document.id;
  }

  body.extra_metadata = {
    ...(ingestJob.config?.metadata ?? {}),
    ...(document.metadata ?? {}),
    ...(document.tenantId && { tenantId: document.tenantId }),
    namespaceId,
    documentId: document.id,
  };

  const unstructuredArgs: PartitionBody["unstructured_args"] = {};

  if (ingestJob.config) {
    if (ingestJob.config.chunkOverlap) {
      unstructuredArgs.overlap = ingestJob.config.chunkOverlap;
      // unstructuredArgs.overlap_all = true;
    }

    if (ingestJob.config.chunkSize) {
      unstructuredArgs.max_characters = ingestJob.config.chunkSize;
      unstructuredArgs.new_after_n_chars = ingestJob.config.chunkSize;
    }

    // chunking_strategy: basic, by_title
    // strategy: auto, fast, hi_res, ocr_only
  }

  if (Object.keys(unstructuredArgs).length > 0) {
    body.unstructured_args = unstructuredArgs;
  }

  return body;
};
