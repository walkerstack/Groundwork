import { env } from "@/env";

import type { LLMConfig } from "@agentset/db";

export const getNamespaceLanguageModel = async (config?: LLMConfig) => {
  if (!config) {
    const { createAzure } = await import("@ai-sdk/azure");

    const defaultAzure = createAzure({
      baseURL: env.DEFAULT_AZURE_BASE_URL,
      apiKey: env.DEFAULT_AZURE_API_KEY,
      apiVersion: env.DEFAULT_AZURE_GPT_4O_VERSION,
    });

    return defaultAzure.languageModel(env.DEFAULT_AZURE_GPT_4O_DEPLOYMENT);
  }

  switch (config.provider) {
    case "OPENAI": {
      const { createOpenAI } = await import("@ai-sdk/openai");

      const { apiKey, model } = config;
      const openai = createOpenAI({ apiKey });
      return openai.languageModel(model);
    }

    case "AZURE_OPENAI": {
      const { createAzure } = await import("@ai-sdk/azure");

      const { apiKey, baseUrl, deployment, apiVersion } = config;
      const azure = createAzure({ apiKey, baseURL: baseUrl, apiVersion });
      return azure.languageModel(deployment);
    }

    default: {
      // This exhaustive check ensures TypeScript will error if a new provider
      // is added without handling it in the switch statement
      const _exhaustiveCheck: never = config;
      throw new Error(`Unknown vector store provider: ${_exhaustiveCheck}`);
    }
  }
};
