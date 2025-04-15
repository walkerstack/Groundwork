import { AgentsetApiError, exceededLimitError } from "@/lib/api/errors";
import { withNamespaceApiHandler } from "@/lib/api/handler";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { parseRequestBody } from "@/lib/api/utils";
import { queryVectorStoreV2 } from "@/lib/vector-store";
import { queryVectorStoreSchema } from "@/schemas/api/query";
import { waitUntil } from "@vercel/functions";

import { db } from "@agentset/db";

// export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB

export const POST = withNamespaceApiHandler(
  async ({ req, namespace, tenantId, organization, headers }) => {
    if (organization.searchUsage >= organization.searchLimit) {
      throw new AgentsetApiError({
        code: "rate_limit_exceeded",
        message: exceededLimitError({
          plan: organization.plan,
          limit: organization.searchLimit,
          type: "retrievals",
        }),
      });
    }

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

    if (!data) {
      throw new AgentsetApiError({
        code: "internal_server_error",
        message: "Failed to parse vector store results",
      });
    }

    waitUntil(
      (async () => {
        // track usage
        await db.organization.update({
          where: {
            id: organization.id,
          },
          data: {
            searchUsage: { increment: 1 },
          },
        });
      })(),
    );

    return makeApiSuccessResponse({
      data: data.results,
      headers,
    });
  },
);
