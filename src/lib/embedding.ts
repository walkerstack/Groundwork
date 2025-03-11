import type { Namespace } from "@prisma/client";
import { env } from "@/env";

export const getNamespaceEmbeddingModel = async (
  namespace: Pick<Namespace, "embeddingConfig">,
) => {
  const config = namespace.embeddingConfig;

  if (!config) {
    const { createAzure } = await import("@ai-sdk/azure");

    const defaultAzure = createAzure({
      baseURL: env.DEFAULT_AZURE_BASE_URL,
      apiKey: env.DEFAULT_AZURE_API_KEY,
      apiVersion: env.DEFAULT_AZURE_TEXT_3_LARGE_EMBEDDING_VERSION,
    });

    return defaultAzure.textEmbeddingModel(
      env.DEFAULT_AZURE_TEXT_3_LARGE_EMBEDDING_DEPLOYMENT,
    );
  }

  switch (config.provider) {
    case "OPENAI": {
      const { createOpenAI } = await import("@ai-sdk/openai");

      const { apiKey, model } = config;
      const openai = createOpenAI({ apiKey });
      return openai.textEmbeddingModel(model);
    }

    case "AZURE_OPENAI": {
      const { createAzure } = await import("@ai-sdk/azure");

      const { apiKey, resourceName, deployment, apiVersion } = config;
      const azure = createAzure({ apiKey, resourceName, apiVersion });
      return azure.textEmbeddingModel(deployment);
    }

    default: {
      // This exhaustive check ensures TypeScript will error if a new provider
      // is added without handling it in the switch statement
      const _exhaustiveCheck: never = config;
      throw new Error(`Unknown vector store provider: ${_exhaustiveCheck}`);
    }
  }
};
