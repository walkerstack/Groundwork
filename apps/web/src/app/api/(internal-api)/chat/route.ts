import type { CoreMessage, JSONValue } from "ai";
import { parseRequestBody } from "@/lib/api/body";
import { AgentsetApiError } from "@/lib/api/errors";
import { withAuthApiHandler } from "@/lib/api/handler";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { getNamespaceEmbeddingModel } from "@/lib/embedding";
import { getNamespaceLanguageModel } from "@/lib/llm";
import { NEW_MESSAGE_PROMPT } from "@/lib/prompts";
import {
  DIGNA_NAMESPACE_ID,
  getNamespaceVectorStore,
  queryVectorStore,
  queryVectorStoreV2,
} from "@/lib/vector-store";
import { chatSchema } from "@/schemas/api/chat";
import { createDataStreamResponse, embed, generateText, streamText } from "ai";

// export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB
export const maxDuration = 60;

export const POST = withAuthApiHandler(async ({ req, namespace, tenantId }) => {
  const body = await chatSchema.parseAsync(await parseRequestBody(req));

  const messagesWithoutQuery = body.messages.slice(0, -1);
  const query =
    body.messages.length > 0
      ? (body.messages[body.messages.length - 1]!.content as string)
      : null;

  if (!query) {
    throw new AgentsetApiError({
      code: "bad_request",
      message: "No query provided",
    });
  }

  // TODO: if the embedding model is managed, track the usage
  const [embeddingModel, vectorStore, languageModel] = await Promise.all([
    getNamespaceEmbeddingModel(namespace),
    getNamespaceVectorStore(namespace, tenantId),
    getNamespaceLanguageModel(), // TODO: pass namespace config
  ]);

  const embedding = await embed({
    model: embeddingModel,
    value: query,
  });

  // TODO: track the usage
  let data;
  if (namespace.id === DIGNA_NAMESPACE_ID) {
    data = await queryVectorStore(vectorStore, embedding.embedding, {
      topK: body.topK,
      minScore: body.minScore,
      filter: body.filter,
      includeMetadata: true,
      includeRelationships: body.includeRelationships,
      rerankLimit: body.rerankLimit,
      query: query,
      rerank: body.rerank,
    });
  } else {
    data = await queryVectorStoreV2(vectorStore, embedding.embedding, {
      topK: body.topK,
      minScore: body.minScore,
      filter: body.filter,
      includeMetadata: true,
      includeRelationships: body.includeRelationships,
      rerankLimit: body.rerankLimit,
      query: query,
      rerank: body.rerank,
    });
  }

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

  if (body.stream) {
    // add the sources to the stream
    return createDataStreamResponse({
      execute: (dataStream) => {
        const messageStream = streamText({
          model: languageModel,
          messages: newMessages,
          onFinish: () => {
            dataStream.writeMessageAnnotation({
              agentset_sources: data,
            } as JSONValue);
          },
        });

        messageStream.mergeIntoDataStream(dataStream);
      },
    });
  }

  const response = await generateText({
    model: languageModel,
    messages: newMessages,
  });

  return makeApiSuccessResponse({
    data: {
      text: response.text,
      sources: data,
    },
  });
});
