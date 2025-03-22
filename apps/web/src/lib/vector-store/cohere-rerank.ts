import { env } from "@/env";

interface RerankDocument {
  id: string;
  score?: number;
  text: string;
  [key: string]: any;
}

interface RerankOptions {
  topK: number;
  query: string;
  cohereApiKey?: string;
}

export async function rerankResults<T extends RerankDocument>(
  results: T[],
  query: string,
  options: RerankOptions
): Promise<T[]> {
  if (!results.length) return results;

  const apiKey = options.cohereApiKey || env.COHERE_API_KEY;

  try {
    // First, create a documents array to send to Cohere
    const documents = results.map(doc => ({
      text: doc.text,
      id: doc.id
    }));

    const response = await fetch("https://api.cohere.ai/v1/rerank", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        documents,
        top_n: options.topK,
        model: "rerank-v3.5"
      })
    });

    if (!response.ok) {
      console.error("Cohere rerank failed:", await response.text());
      return results;
    }

    const data = await response.json();

    // Inspect Cohere response structure in case of errors
    if (!data.results || !Array.isArray(data.results)) {
      console.error("Unexpected Cohere response format:", JSON.stringify(data));
      return results;
    }
    // The response contains indices that correspond to the original documents array
    return data.results.map((result: any) => {
      // Use the index from the result to find the original document
      const index = result.index;
      if (index === undefined || index < 0 || index >= results.length) {
        console.error(`Invalid index ${index} in rerank result`, result);
        return null;
      }

      const originalDoc = results[index];

      return {
        ...originalDoc,
        score: result.relevance_score
      };
    }).filter(Boolean) as T[];
  } catch (error) {
    console.error("Error reranking results:", error);
    return results;
  }
}