import type { CoreMessage, JSONValue } from "ai";
import { AgentsetApiError } from "@/lib/api/errors";
import { withAuthApiHandler } from "@/lib/api/handler";
import { parseRequestBody } from "@/lib/api/utils";
import { getNamespaceLanguageModel } from "@/lib/llm";
import { NEW_MESSAGE_PROMPT } from "@/lib/prompts";
import { queryVectorStoreV2 } from "@/lib/vector-store";
import z from "@/lib/zod";
import { chatSchema } from "@/schemas/api/chat";
import { createDataStreamResponse, streamText } from "ai";

// export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB
export const maxDuration = 60;

export const POST = withAuthApiHandler(
  async ({ req, namespace, tenantId, headers }) => {
    const body = await z
      .object({
        temperature: z.number().optional(),
      })
      .and(chatSchema)
      .parseAsync(await parseRequestBody(req));

    const messagesWithoutQuery = body.messages.slice(0, -1);
    const query =
      body.messages.length > 0
        ? body.messages[body.messages.length - 1]!.content
        : null;

    if (!query) {
      throw new AgentsetApiError({
        code: "bad_request",
        message: "No query provided",
      });
    }

    const languageModel = await getNamespaceLanguageModel(); // TODO: pass namespace config

    // TODO: track the usage
    const data = await queryVectorStoreV2(namespace, {
      query: query,
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
        message: "Failed to parse chunks",
      });
    }

    const newMessages: CoreMessage[] = [
      { role: "system", content: body.systemPrompt },
      ...messagesWithoutQuery,
      {
        role: "user",
        content: NEW_MESSAGE_PROMPT.compile({
          chunks: data
            .map((chunk, idx) => `[${idx + 1}]: ${chunk.text}`)
            .join("\n\n"),
          query,
        }),
      },
    ];

    // add the sources to the stream
    return createDataStreamResponse({
      execute: (dataStream) => {
        dataStream.writeMessageAnnotation({
          agentset_sources: data as unknown as JSONValue,
        });

        const messageStream = streamText({
          model: languageModel,
          messages: newMessages,
          temperature: body.temperature,
        });

        messageStream.mergeIntoDataStream(dataStream);
      },
      headers,
    });
  },
);
