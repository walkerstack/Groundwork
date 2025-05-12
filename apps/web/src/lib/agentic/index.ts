import type { CoreMessage, JSONValue, LanguageModelV1 } from "ai";
import { createDataStreamResponse, streamText } from "ai";

import type { Namespace } from "@agentset/db";

import type {
  QueryVectorStoreOptions,
  QueryVectorStoreResult,
} from "../vector-store/parse";
import type { Queries } from "./utils";
// import { AgentsetApiError } from "../api/errors";
import { NEW_MESSAGE_PROMPT } from "../prompts";
import { queryVectorStore } from "../vector-store/parse";
import { evaluateQueries, generateQueries } from "./utils";

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
    maxEvals = 3,
    tokenBudget = 8152,
  }: {
    model: LanguageModelV1;
    queryOptions?: Omit<QueryVectorStoreOptions, "query">;
    headers?: HeadersInit;
    systemPrompt?: string;
    temperature?: number;
    messagesWithoutQuery: CoreMessage[];
    lastMessage: string;
    afterQueries?: (totalQueries: number) => void;
    maxEvals?: number;
    tokenBudget?: number;
  },
) => {
  const messages: CoreMessage[] = [
    ...messagesWithoutQuery,
    { role: "user", content: lastMessage },
  ];

  return createDataStreamResponse({
    execute: async (dataStream) => {
      dataStream.writeMessageAnnotation({
        type: "status",
        value: "generating-queries",
      });

      // step 1. generate queries
      const queries: Queries = [];
      const chunks: Record<string, QueryVectorStoreResult["results"][number]> =
        {};
      const queryToResult: Record<string, QueryVectorStoreResult> = {};
      let totalQueries = 0;
      const totalTokens = 0;

      for (let i = 0; i < maxEvals; i++) {
        console.log(`[EVAL LOOP] ${i + 1} / ${maxEvals}`);

        const newQueries = await generateQueries(model, messages, queries);
        newQueries.forEach((q) => {
          if (queries.includes(q)) return;
          queries.push(q);
        });

        dataStream.writeMessageAnnotation({
          type: "status",
          value: "searching",
          queries: newQueries,
        });

        const data = (
          await Promise.all(
            newQueries.map(async (query) => {
              const queryResult = await queryVectorStore(namespace, {
                query: query.query,
                topK: 50,
                rerankLimit: 15,
                rerank: true,
              });
              totalQueries++;
              return queryResult;
            }),
          )
        ).filter((d) => d !== null);

        data.forEach((d) => {
          queryToResult[d.query] = d;

          d.results.forEach((r) => {
            if (chunks[r.id]) return;
            chunks[r.id] = r;
          });
        });

        const canAnswer = await evaluateQueries(
          model,
          messages,
          Object.values(chunks),
        );

        if (canAnswer) break;
      }

      afterQueries?.(totalQueries);

      dataStream.writeMessageAnnotation({
        type: "status",
        value: "generating-answer",
      });

      // TODO: shrink chunks and only select relevant ones to pass to the LLM
      const dedupedData = Object.values(chunks);
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
        logs: Object.values(queryToResult) as unknown as JSONValue,
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
