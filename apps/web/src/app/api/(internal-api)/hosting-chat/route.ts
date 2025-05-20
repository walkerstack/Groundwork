import agenticPipeline from "@/lib/agentic";
import { AgentsetApiError } from "@/lib/api/errors";
import { withPublicApiHandler } from "@/lib/api/handler/public";
import { parseRequestBody } from "@/lib/api/utils";
import { getNamespaceLanguageModel } from "@/lib/llm";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import { waitUntil } from "@vercel/functions";

import { db } from "@agentset/db";

import { hostingChatSchema } from "./schema";

const incrementUsage = (namespaceId: string, queries: number) => {
  waitUntil(
    (async () => {
      // track usage
      await db.namespace.update({
        where: {
          id: namespaceId,
        },
        data: {
          organization: {
            update: {
              searchUsage: { increment: queries },
            },
          },
        },
      });
    })(),
  );
};

const getHosting = async (namespaceId: string) => {
  return db.hosting.findFirst({
    where: {
      namespaceId,
    },
    select: {
      id: true,
      systemPrompt: true,
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
};

// export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB
export const maxDuration = 60;

export const POST = withPublicApiHandler(
  async ({ req, searchParams, headers }) => {
    const body = await hostingChatSchema.parseAsync(
      await parseRequestBody(req),
    );
    const messagesWithoutQuery = body.messages.slice(0, -1);
    const lastMessage =
      body.messages.length > 0
        ? (body.messages[body.messages.length - 1]!.content as string)
        : null;

    if (!lastMessage) {
      throw new AgentsetApiError({
        code: "bad_request",
        message: "Messages must contain at least one message",
      });
    }

    const namespaceId = searchParams.namespaceId;
    if (!namespaceId) {
      throw new AgentsetApiError({
        code: "bad_request",
        message: "Namespace ID is required",
      });
    }

    const hosting = await getHosting(namespaceId);
    if (!hosting) {
      throw new AgentsetApiError({
        code: "not_found",
        message: "Hosting not found",
      });
    }

    // TODO: check if protected

    // TODO: pass namespace config
    const languageModel = await getNamespaceLanguageModel();

    const result = agenticPipeline(hosting.namespace, {
      model: languageModel,
      // TODO: get from hosting
      queryOptions: {
        topK: 50,
        rerankLimit: 15,
        rerank: true,
        includeMetadata: true,
      },
      systemPrompt: hosting.systemPrompt ?? DEFAULT_SYSTEM_PROMPT.compile(),
      temperature: 0,
      messagesWithoutQuery,
      lastMessage,
      afterQueries: (totalQueries) => {
        incrementUsage(hosting.namespace.id, totalQueries);
      },
      headers,
    });

    return result;
  },
);
