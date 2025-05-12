import type { CoreMessage, JSONValue, LanguageModelV1 } from "ai";
import {
  createDataStreamResponse,
  generateObject,
  generateText,
  streamText,
} from "ai";
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
    afterQueries,
  }: {
    model: LanguageModelV1;
    queryOptions?: Omit<QueryVectorStoreOptions, "query">;
    headers?: HeadersInit;
    systemPrompt?: string;
    temperature?: number;
    messagesWithoutQuery: CoreMessage[];
    lastMessage: string;
    afterQueries?: (totalQueries: number) => void;
  },
) => {
  return createDataStreamResponse({
    execute: async (dataStream) => {
      dataStream.writeMessageAnnotation({
        type: "status",
        value: "generating-queries",
      });

      const schema = z.object({
        queries: z.array(
          z.object({
            type: z.enum(["keyword", "semantic"]),
            query: z.string(),
          }),
        ),
      });

      // step 1. generate queries
      const queriesResult = await generateText({
        model,
        system: GENERATE_QUERIES_PROMPT,
        temperature: 0,
        messages: [
          ...messagesWithoutQuery,
          { role: "user", content: lastMessage },
        ],
      });

      const queries = schema.parse(JSON.parse(queriesResult.text));

      dataStream.writeMessageAnnotation({
        type: "status",
        value: "searching",
        queries: queries.queries,
      });

      let totalQueries = 0;
      const data = (
        await Promise.all(
          queries.queries.map(async (query) => {
            const queryResult = await queryVectorStore(namespace, {
              query: query.query,
              ...(queryOptions ?? { topK: 10 }),
            });
            totalQueries++;
            return queryResult;
          }),
        )
      ).filter((d) => d !== null);

      afterQueries?.(totalQueries);

      dataStream.writeMessageAnnotation({
        type: "status",
        value: "generating-answer",
      });

      const dedupedData = Object.values(
        data
          .flatMap((d) => d.results)
          .reduce(
            (acc, chunk) => {
              if (acc[chunk.id]) return acc;

              acc[chunk.id] = chunk;
              return acc;
            },
            {} as Record<string, (typeof data)[number]["results"][number]>,
          ),
      );

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
        value: { results: dedupedData } as unknown as JSONValue,
        logs: data as unknown as JSONValue,
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
