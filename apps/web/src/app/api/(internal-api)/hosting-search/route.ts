import { agenticSearch } from "@/lib/agentic/search";
import { AgentsetApiError } from "@/lib/api/errors";
import { withPublicApiHandler } from "@/lib/api/handler/public";
import { hostingAuth } from "@/lib/api/hosting-auth";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { incrementSearchUsage } from "@/lib/api/usage";
import { parseRequestBody } from "@/lib/api/utils";
import { getNamespaceLanguageModel } from "@/lib/llm";

import { db } from "@agentset/db";

import { hostingSearchSchema } from "./schema";

// export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB
export const maxDuration = 60;

export const POST = withPublicApiHandler(
  async ({ req, searchParams, headers }) => {
    const body = await hostingSearchSchema.parseAsync(
      await parseRequestBody(req),
    );

    const namespaceId = searchParams.namespaceId;
    if (!namespaceId) {
      throw new AgentsetApiError({
        code: "bad_request",
        message: "Namespace ID is required",
      });
    }

    const hosting = await db.hosting.findFirst({
      where: {
        namespaceId,
      },
      select: {
        id: true,
        protected: true,
        allowedEmails: true,
        allowedEmailDomains: true,
        namespace: {
          select: {
            id: true,
            createdAt: true,
            vectorStoreConfig: true,
            embeddingConfig: true,
          },
        },
      },
    });

    if (!hosting) {
      throw new AgentsetApiError({
        code: "not_found",
        message: "Hosting not found",
      });
    }

    await hostingAuth(req, hosting);

    // TODO: pass namespace config
    const languageModel = await getNamespaceLanguageModel();

    const result = await agenticSearch(hosting.namespace, {
      model: languageModel,
      // TODO: get from hosting
      queryOptions: {
        topK: 50,
        rerankLimit: 15,
        rerank: true,
        includeMetadata: true,
      },
      messages: [
        {
          role: "user",
          content: body.query,
        },
      ],
    });

    incrementSearchUsage(hosting.namespace.id, result.totalQueries);

    return makeApiSuccessResponse({
      data: {
        totalQueries: result.totalQueries,
        queries: result.queries,
        chunks: Object.values(result.chunks),
      },
      headers,
    });
  },
);
