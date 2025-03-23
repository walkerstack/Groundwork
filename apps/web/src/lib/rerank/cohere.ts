import { env } from "@/env";
import { CohereClient } from "cohere-ai";

import { tryCatch } from "../error";

interface BaseRerankDocument {
  text: string;
}

interface RerankOptions {
  limit: number;
  query: string;
  cohereApiKey?: string;
}

type RerankResult<T extends BaseRerankDocument> = T & {
  rerankScore?: number;
};

export async function rerankResults<T extends BaseRerankDocument>(
  results: T[],
  options: RerankOptions,
): Promise<RerankResult<T>[]> {
  if (!results.length) return results;

  const client = new CohereClient({
    token: options.cohereApiKey || env.DEFAULT_COHERE_API_KEY,
  });

  const { data: rerankResults, error } = await tryCatch(
    client.v2.rerank({
      documents: results.map((doc) => doc.text),
      query: options.query,
      topN: options.limit,
      model: "rerank-v3.5",
      returnDocuments: false,
    }),
  );

  if (error) {
    console.error("Cohere rerank failed:", error);
    return results;
  }

  // TODO: track usage with rerankResults.meta
  return rerankResults.results
    .map((result) => {
      // Use the index from the result to find the original document
      const originalIndex = result.index;
      const originalDoc = results[originalIndex];

      if (!originalDoc) {
        return null;
      }

      return {
        ...originalDoc,
        rerankScore: result.relevanceScore,
      };
    })
    .filter(Boolean) as RerankResult<T>[];
}
