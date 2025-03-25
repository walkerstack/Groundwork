import { parseRequestBody } from "@/lib/api/body";
import { withNamespaceApiHandler } from "@/lib/api/handler";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { getNamespaceEmbeddingModel } from "@/lib/embedding";
import {
  DIGNA_NAMESPACE_ID,
  getNamespaceVectorStore,
  queryVectorStore,
  queryVectorStoreV2,
} from "@/lib/vector-store";
import { queryVectorStoreSchema } from "@/schemas/api/query";
import { embed } from "ai";

// export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB

export const POST = withNamespaceApiHandler(
  async ({ req, namespace, tenantId }) => {
    const body = await queryVectorStoreSchema.parseAsync(
      await parseRequestBody(req),
    );

    // TODO: if the embedding model is managed, track the usage
    const [embeddingModel, vectorStore] = await Promise.all([
      getNamespaceEmbeddingModel(namespace),
      getNamespaceVectorStore(namespace, tenantId),
    ]);

    const embedding = await embed({
      model: embeddingModel,
      value: body.query,
    });

    // TODO: track the usage
    let data;
    if (namespace.id === DIGNA_NAMESPACE_ID) {
      data = await queryVectorStore(vectorStore, embedding.embedding, {
        topK: body.topK,
        minScore: body.minScore,
        filter: body.filter,
        includeMetadata: body.includeMetadata,
        includeRelationships: body.includeRelationships,
        rerankLimit: body.rerankLimit,
        query: body.query,
        rerank: body.rerank,
      });
    } else {
      data = await queryVectorStoreV2(vectorStore, embedding.embedding, {
        topK: body.topK,
        minScore: body.minScore,
        filter: body.filter,
        includeMetadata: body.includeMetadata,
        includeRelationships: body.includeRelationships,
        rerankLimit: body.rerankLimit,
        query: body.query,
        rerank: body.rerank,
      });
    }

    return makeApiSuccessResponse({
      data,
    });
  },
);
