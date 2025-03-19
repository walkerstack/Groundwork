import { getApiKeyScopeAndOrganizationId, getNamespaceConfig } from "@/lib/api";
import { getNamespaceEmbeddingModel } from "@/lib/embedding";
import { getNamespaceVectorStore, queryVectorStore } from "@/lib/vector-store";
import { embed } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";
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
  const _apiKey = request.headers.get("Authorization");
  const apiKey = _apiKey?.replace("Bearer ", "");

  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: "Invalid API key" },
      { status: 401 },
    );
  }

  const orgApiKey = await getApiKeyScopeAndOrganizationId(apiKey);

  if (!orgApiKey) {
    return NextResponse.json(
      { success: false, message: "Invalid API key" },
      { status: 401 },
    );
  }

  const result = await schema.safeParseAsync(await request.json());

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const namespace = await getNamespaceConfig(
    result.data.namespaceId,
    orgApiKey.organizationId,
  );

  if (!namespace) {
    return NextResponse.json(
      { success: false, message: "Namespace not found" },
      { status: 404 },
    );
  }

  // TODO: if the embedding model is managed, track the usage
  const [embeddingModel, vectorStore] = await Promise.all([
    getNamespaceEmbeddingModel(namespace),
    getNamespaceVectorStore(
      namespace,
      namespace.id === "cm7zzvk4w0001ri45hfl7lkyo"
        ? "agentset:digna"
        : undefined,
    ),
  ]);

  const embedding = await embed({
    model: embeddingModel,
    value: result.data.query,
  });

  // TODO: track the usage
  const data = await queryVectorStore(vectorStore, embedding.embedding, {
    topK: result.data.topK,
    minScore: result.data.minScore,
    filter: result.data.filter,
    includeMetadata: result.data.includeMetadata,
    includeRelationships: result.data.includeRelationships,
  });

  return NextResponse.json({
    success: true,
    data,
  });
}
