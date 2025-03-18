import type { Namespace } from "@prisma/client";
import { env } from "@/env";
import { Pinecone } from "./pinecone";

export const getNamespaceVectorStore = async (
  namespace: Pick<Namespace, "vectorStoreConfig" | "id">,
  tenant?: string,
) => {
  const config = namespace.vectorStoreConfig;

  const tenantId = tenant
    ? `agentset:${namespace.id}:${tenant}`
    : `agentset:${namespace.id}`;

  // TODO: handle different embedding models
  if (!config) {
    return new Pinecone({
      apiKey: env.DEFAULT_PINECONE_API_KEY,
      indexHost: env.DEFAULT_PINECONE_HOST,
      namespace: tenantId,
    });
  }

  switch (config.provider) {
    case "PINECONE": {
      const { apiKey, indexHost } = config;
      return new Pinecone({ apiKey, indexHost, namespace: tenantId });
    }

    default: {
      // This exhaustive check ensures TypeScript will error if a new provider
      // is added without handling it in the switch statement
      const _exhaustiveCheck: never = config.provider;
      throw new Error(`Unknown vector store provider: ${_exhaustiveCheck}`);
    }
  }
};

export { queryVectorStore } from "./parse";
