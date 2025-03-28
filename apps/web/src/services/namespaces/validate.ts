import { getNamespaceEmbeddingModel } from "@/lib/embedding";
import { getNamespaceVectorStore } from "@/lib/vector-store";
import { embed } from "ai";

import type { Namespace } from "@agentset/db";

const modelToDimensions: Record<
  PrismaJson.NamespaceEmbeddingConfig["model"],
  number
> = {
  "text-embedding-3-large": 3072,
  "text-embedding-3-small": 1536,
};

export const validateVectorStoreConfig = async (
  vectorStoreConfig?: Namespace["vectorStoreConfig"],
  embeddingConfig?: Namespace["embeddingConfig"],
) => {
  if (!vectorStoreConfig) {
    return {
      success: true as const,
    };
  }

  const v = await getNamespaceVectorStore({
    id: "",
    vectorStoreConfig,
  });

  try {
    const dimensions = await v.getDimensions();
    if (embeddingConfig) {
      const embeddingDimensions = modelToDimensions[embeddingConfig.model];
      if (dimensions !== embeddingDimensions) {
        return {
          success: false as const,
          error: `Embedding dimensions mismatch: ${dimensions} !== ${embeddingDimensions}`,
        };
      }
    }

    return {
      success: true as const,
    };
  } catch {
    return {
      success: false as const,
      error:
        "Failed to validate vector store config, make sure the API key is valid",
    };
  }
};

export const validateEmbeddingModel = async (
  embeddingConfig?: Namespace["embeddingConfig"],
) => {
  if (!embeddingConfig) {
    return {
      success: true as const,
    };
  }

  const model = await getNamespaceEmbeddingModel({ embeddingConfig });

  try {
    await embed({
      model,
      value: "Hello, world!",
    });

    return {
      success: true as const,
    };
  } catch {
    return {
      success: false as const,
      error:
        "Failed to validate embedding model, make sure the API key is valid",
    };
  }
};
