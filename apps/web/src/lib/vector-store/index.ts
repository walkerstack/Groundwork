import { env } from "@/env";

import type { Namespace } from "@agentset/db";

export const DIGNA_NAMESPACE_ID = "cm7zzvk4w0001ri45hfl7lkyo";

export const getNamespaceVectorStore = async (
  namespace: Pick<Namespace, "vectorStoreConfig" | "id">,
  tenant?: string,
) => {
  const config = namespace.vectorStoreConfig;

  const tenantId = tenant
    ? `agentset:${namespace.id}:${tenant}`
    : `agentset:${namespace.id === DIGNA_NAMESPACE_ID ? "digna" : namespace.id}`;

  // TODO: handle different embedding models
  if (!config) {
    const { Pinecone } = await import("./pinecone");
    return new Pinecone({
      apiKey: env.DEFAULT_PINECONE_API_KEY,
      indexHost: env.DEFAULT_PINECONE_HOST,
      namespace: tenantId,
    });
  }

  switch (config.provider) {
    case "PINECONE": {
      const { Pinecone } = await import("./pinecone");
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
