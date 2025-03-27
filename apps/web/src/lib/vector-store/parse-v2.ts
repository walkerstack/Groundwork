import type { BaseNode, Metadata } from "llamaindex";
import { metadataDictToNode } from "@llamaindex/core/vector-store";
import { embed } from "ai";
import { MetadataMode } from "llamaindex";

import type { Namespace } from "@agentset/db";

import type { RerankResult } from "../rerank/cohere";
import { getNamespaceVectorStore } from ".";
import { getNamespaceEmbeddingModel } from "../embedding";
import { filterFalsy } from "../functions";
import { rerankResults } from "../rerank/cohere";

type Result = {
  id: string;
  node: BaseNode<Metadata>;
  score?: number;
  rerankScore?: number;
};

const formatResults = (
  results: Result[],
  {
    includeMetadata,
    includeRelationships,
  }: { includeMetadata?: boolean; includeRelationships?: boolean },
) => {
  return results.map((result) => {
    return {
      id: result.id,
      text: result.node.getContent(MetadataMode.NONE),
      metadata: includeMetadata ? result.node.metadata : undefined,
      relationships: includeRelationships
        ? result.node.relationships
        : undefined,
      score: result.score,
      rerankScore: result.rerankScore,
    };
  });
};

export const queryVectorStoreV2 = async (
  namespace: Namespace,
  options: {
    query: string;
    topK: number;
    tenantId?: string;
    minScore?: number;
    filter?: Record<string, string>;
    includeMetadata?: boolean;
    includeRelationships?: boolean;
    rerankLimit?: number;
    rerank?: boolean;
  },
) => {
  // TODO: if the embedding model is managed, track the usage
  const [embeddingModel, vectorStore] = await Promise.all([
    getNamespaceEmbeddingModel(namespace),
    getNamespaceVectorStore(namespace, options.tenantId),
  ]);

  const embedding = await embed({
    model: embeddingModel,
    value: options.query,
  });

  // TODO: track usage
  let { matches } = await vectorStore.query({
    vector: embedding.embedding,
    topK: options.topK,
    filter: options.filter,
    includeMetadata: true,
  });

  if (options.minScore !== undefined) {
    matches = matches.filter(
      (match) => match.score && match.score >= options.minScore!,
    );
  }

  let parsedResults = filterFalsy(
    matches.map((match) => {
      const nodeContent = match.metadata?._node_content;
      if (!nodeContent) return null;

      try {
        return {
          id: match.id,
          score: match.score,
          node: metadataDictToNode(match.metadata!),
        };
      } catch (e) {
        console.error(e);
        return null;
      }
    }),
  );

  if (matches.length > 0 && parsedResults.length === 0) {
    return null;
  }

  // If re-ranking is enabled and we have a query, perform reranking
  if (options.rerank && options.query) {
    parsedResults = await rerankResults(parsedResults, {
      limit: options.rerankLimit || options.topK,
      query: options.query,
    });
  }

  const results = parsedResults as RerankResult<
    (typeof parsedResults)[number]
  >[];

  return formatResults(results, {
    includeMetadata: options.includeMetadata,
    includeRelationships: options.includeRelationships,
  });
};
