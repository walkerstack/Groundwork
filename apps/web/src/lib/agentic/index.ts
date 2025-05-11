import type { CoreMessage, JSONValue, LanguageModelV1 } from "ai";
import { createDataStreamResponse, generateObject, streamText } from "ai";
import { z } from "zod";

import type { Namespace } from "@agentset/db";

import type { QueryVectorStoreOptions } from "../vector-store/parse";
// import { AgentsetApiError } from "../api/errors";
import { NEW_MESSAGE_PROMPT } from "../prompts";
import { queryVectorStore } from "../vector-store/parse";
import { GENERATE_QUERIES_PROMPT } from "./prompts";

const agenticPipeline = (
  namespace: Namespace,
  {
    model,
    queryOptions,
    headers,
    systemPrompt,
    temperature,
    messagesWithoutQuery,
    lastMessage,
  }: {
    model: LanguageModelV1;
    queryOptions?: Omit<QueryVectorStoreOptions, "query">;
    headers?: HeadersInit;
    systemPrompt?: string;
    temperature?: number;
    messagesWithoutQuery: CoreMessage[];
    lastMessage: string;
  },
) => {
  return createDataStreamResponse({
    execute: async (dataStream) => {
      dataStream.writeMessageAnnotation({
        type: "status",
        value: "generating-queries",
      });

      // step 1. generate queries
      const queries = await generateObject({
        model,
        system: GENERATE_QUERIES_PROMPT,
        messages: [
          ...messagesWithoutQuery,
          { role: "user", content: lastMessage },
        ],
        output: "array",
        schema: z.object({
          type: z.enum(["keyword", "semantic"]),
          query: z.string(),
        }),
      });

      dataStream.writeMessageAnnotation({
        type: "status",
        value: "searching",
        queries: queries.object,
      });

      const data = (
        await Promise.all(
          queries.object.map(async (query) => {
            return queryVectorStore(namespace, {
              query: query.query,
              ...(queryOptions ?? { topK: 10 }),
            });
          }),
        )
      ).flatMap((d) => d?.results ?? []);

      dataStream.writeMessageAnnotation({
        type: "status",
        value: "generating-answer",
      });

      const ids: string[] = [];
      const dedupedData = data.filter((d) => {
        if (ids.includes(d.id)) {
          return false;
        }
        ids.push(d.id);
        return true;
      });

      const newMessages: CoreMessage[] = [
        ...messagesWithoutQuery,
        {
          role: "user",
          content: NEW_MESSAGE_PROMPT.compile({
            chunks: dedupedData
              .map(
                (chunk, idx) =>
                  `<chunk_${idx + 1}>\n${chunk.text}\n</chunk_${idx + 1}>`,
              )
              .join("\n\n"),
            // put the original query in the message to help with context
            query: `<query>${lastMessage}</query>`,
          }),
        },
      ];

      const messageStream = streamText({
        model: model,
        system: systemPrompt,
        messages: newMessages,
        temperature: temperature,
        onError: (error) => {
          console.error(error);
        },
      });

      dataStream.writeMessageAnnotation({
        type: "agentset_sources",
        value: {
          query: "",
          unorderedIds: [],
          results: data,
        } as unknown as JSONValue,
      });
      messageStream.mergeIntoDataStream(dataStream);
    },
    onError(error) {
      console.error(error);
      return "An error occurred";
    },
    headers,
  });
};

export default agenticPipeline;
