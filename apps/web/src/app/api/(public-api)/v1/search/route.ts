import type { NextRequest } from "next/server";
import { getNamespaceConfig } from "@/lib/api-utils";
import { authenticateRequest } from "@/lib/api-utils/auth";
import {
  makeApiSuccessResponse,
  notFoundResponse,
} from "@/lib/api-utils/response";
import { getTenantFromRequest } from "@/lib/api-utils/tenant";
import { validateBody } from "@/lib/api-utils/validation";
import { getNamespaceEmbeddingModel } from "@/lib/embedding";
import {
  DIGNA_NAMESPACE_ID,
  getNamespaceVectorStore,
  queryVectorStore,
  queryVectorStoreV2,
} from "@/lib/vector-store";
import { embed } from "ai";
import { z } from "zod";

// export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB

const schema = z.object({
  query: z.string(),
  namespaceId: z.string(),
  topK: z.number().min(1).max(100).optional().default(10),
  filter: z.record(z.string(), z.any()).optional(),
  minScore: z.number().min(0).max(1).optional(),
  includeRelationships: z.boolean().optional().default(false),
  includeMetadata: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult.error) return authResult.error;
  const orgApiKey = authResult.data;

  const validatedBody = await validateBody(request, schema);
  if (validatedBody.error) return validatedBody.error;
  const body = validatedBody.data;

  const namespace = await getNamespaceConfig(
    body.namespaceId,
    orgApiKey.organizationId,
  );

  if (!namespace) return notFoundResponse("Namespace not found");

  const tenantId = getTenantFromRequest(request);

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
    });
  } else {
    data = await queryVectorStoreV2(vectorStore, embedding.embedding, {
      topK: body.topK,
      minScore: body.minScore,
      filter: body.filter,
      includeMetadata: body.includeMetadata,
      includeRelationships: body.includeRelationships,
    });
  }

  return makeApiSuccessResponse({
    data,
  });
}
