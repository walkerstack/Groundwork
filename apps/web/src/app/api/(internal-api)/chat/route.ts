import type { CoreMessage, JSONValue } from "ai";
import { AgentsetApiError } from "@/lib/api/errors";
import { withAuthApiHandler } from "@/lib/api/handler";
import { parseRequestBody } from "@/lib/api/utils";
import { getNamespaceLanguageModel } from "@/lib/llm";
import {
  CONDENSE_SYSTEM_PROMPT,
  CONDENSE_USER_PROMPT,
  NEW_MESSAGE_PROMPT,
} from "@/lib/prompts";
import { queryVectorStoreV2 } from "@/lib/vector-store";
import { createDataStreamResponse, generateText, streamText } from "ai";

import { chatSchema } from "./schema";

// export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB
export const maxDuration = 60;

export const POST = withAuthApiHandler(
  async ({ req, namespace, tenantId, headers }) => {
    const body = await chatSchema.parseAsync(await parseRequestBody(req));

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

    // TODO: pass namespace config
    const languageModel = await getNamespaceLanguageModel();

    let query: string;
    if (messagesWithoutQuery.length === 0) {
      query = lastMessage;
    } else {
      // limit messagesWithoutQuery to the last 10 messages
      const messagesToCondense = messagesWithoutQuery.slice(-10);

      // we need to condense the messages + last message into a single query
      query = (
        await generateText({
          model: languageModel,
          system: CONDENSE_SYSTEM_PROMPT.compile(),
          messages: [
            {
              role: "user",
              content: CONDENSE_USER_PROMPT.compile({
                chatHistory: messagesToCondense
                  .map(
                    (m) =>
                      `- ${m.role === "user" ? "Human" : "Assistant"}: ${m.content as string}`,
                  )
                  .join("\n\n"),
                query: lastMessage,
              }),
            },
          ],
        })
      ).text;
    }

    // TODO: track the usage
    const data = await queryVectorStoreV2(namespace, {
      query,
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
      ...messagesWithoutQuery,
      {
        role: "user",
        content: NEW_MESSAGE_PROMPT.compile({
          chunks: data.results
            .map((chunk, idx) => `[${idx + 1}]: ${chunk.text}`)
            .join("\n\n"),
          query: lastMessage, // put the original query in the message to help with context
        }),
      },
    ];

    // add the sources to the stream
    return createDataStreamResponse({
      execute: (dataStream) => {
        const messageStream = streamText({
          model: languageModel,
          system: body.systemPrompt,
          messages: newMessages,
          temperature: body.temperature,
        });

        dataStream.writeMessageAnnotation({
          agentset_sources: data as unknown as JSONValue,
        });
        messageStream.mergeIntoDataStream(dataStream);
      },
      headers,
    });
  },
);
