import { withNamespaceApiHandler } from "@/lib/api/handler";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { parseRequestBody } from "@/lib/api/utils";
import { queryVectorStoreV2 } from "@/lib/vector-store";
import { queryVectorStoreSchema } from "@/schemas/api/query";

// export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB

export const POST = withNamespaceApiHandler(
  async ({ req, namespace, tenantId, headers }) => {
    const body = await queryVectorStoreSchema.parseAsync(
      await parseRequestBody(req),
    );

    // TODO: track the usage
    const data = await queryVectorStoreV2(namespace, {
      query: body.query,
      tenantId,
      topK: body.topK,
      minScore: body.minScore,
      filter: body.filter,
      includeMetadata: body.includeMetadata,
      includeRelationships: body.includeRelationships,
      rerankLimit: body.rerankLimit,
      rerank: body.rerank,
    });

    return makeApiSuccessResponse({
      data,
      headers,
    });
  },
);
