import type { Document, IngestJob, Namespace } from "@agentset/db";

import { presignGetUrl } from "./s3";

interface PartitionBody {
  // one of url or text is required
  url?: string;
  text?: string;

  filename: string;
  extra_metadata?: Record<string, unknown>;
  // tokenizer_model?: PrismaJson.NamespaceEmbeddingConfig["model"];
  batch_size?: number; // default to 5
  unstructured_args?: {
    overlap?: number;
    overlap_all?: boolean; // if true, overlap is applied to all chunks
    max_characters?: number; // hard chunk size
    new_after_n_chars?: number; // soft chunk size
    chunking_strategy?: "basic" | "by_title";
    strategy?: "auto" | "fast" | "hi_res" | "ocr_only";
    languages?: string[];
  };
}

export const getPartitionDocumentBody = async (
  document: Document,
  ingestJob: IngestJob,
  namespace: Pick<Namespace, "id" | "embeddingConfig">,
) => {
  const body: Partial<PartitionBody> = {};

  if (document.source.type === "TEXT") {
    body.text = document.source.text;
    body.filename = document.name || `${document.id}.txt`;
  } else if (document.source.type === "FILE") {
    body.url = document.source.fileUrl;
    body.filename = document.name || document.id;
  } else if (document.source.type === "MANAGED_FILE") {
    const url = await presignGetUrl(document.source.key);
    body.url = url.url;
    body.filename = document.name || document.id;
  }

  body.extra_metadata = {
    ...(ingestJob.config?.metadata ?? {}),
    ...(document.metadata ?? {}),
    ...(document.tenantId && { tenantId: document.tenantId }),
    namespaceId: namespace.id,
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

  // if (namespace.embeddingConfig?.model) {
  //   body.tokenizer_model = namespace.embeddingConfig.model;
  // }

  body.batch_size = 30;

  return body;
};
