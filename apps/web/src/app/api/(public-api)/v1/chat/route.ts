import type { JSONValue } from "ai";
import type { NextRequest } from "next/server";
import { getNamespaceConfig } from "@/lib/api-utils";
import {
  authenticateRequest,
  authenticateRequestWithSession,
} from "@/lib/api-utils/auth";
import {
  makeApiErrorResponse,
  makeApiSuccessResponse,
  notFoundResponse,
} from "@/lib/api-utils/response";
import { getTenantFromRequest } from "@/lib/api-utils/tenant";
import { validateBody } from "@/lib/api-utils/validation";
import { getNamespaceEmbeddingModel } from "@/lib/embedding";
import { getNamespaceLanguageModel } from "@/lib/llm";
import {
  DIGNA_NAMESPACE_ID,
  getNamespaceVectorStore,
  queryVectorStore,
  queryVectorStoreV2,
} from "@/lib/vector-store";
import { createDataStreamResponse, embed, generateText, streamText } from "ai";
import { z } from "zod";

import { DEFAULT_SYSTEM_PROMPT, NEW_MESSAGE_PROMPT } from "./prompts";

export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB
export const maxDuration = 60;

const schema = z.object({
  namespaceId: z.string(),
  systemPrompt: z.string().optional().default(DEFAULT_SYSTEM_PROMPT.compile()),
  messages: z.array(z.any()),
  stream: z.boolean().optional().default(false),
  topK: z.number().min(1).max(100).optional().default(10),
  filter: z.record(z.string(), z.any()).optional(),
  minScore: z.number().min(0).max(1).optional(),
  includeRelationships: z.boolean().optional().default(false),
  includeMetadata: z.boolean().optional().default(true),
  auth: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  const validatedBody = await validateBody(request, schema);
  if (validatedBody.error) return validatedBody.error;
  const body = validatedBody.data;

  let orgId: string;
  if (body.auth) {
    const authResult = await authenticateRequestWithSession(
      request,
      body.namespaceId,
    );
    if (authResult.error) return authResult.error;
    orgId = authResult.data.organizationId;
  } else {
    const authResult = await authenticateRequest(request);
    if (authResult.error) return authResult.error;
    orgId = authResult.data.organizationId;
  }

  const messagesWithoutQuery = body.messages.slice(0, -1);
  const query =
    body.messages.length > 0
      ? (body.messages[body.messages.length - 1]!.content as string)
      : null;

  if (!query) {
    return makeApiErrorResponse({
      message: "No query provided",
      status: 400,
    });
  }

  const namespace = await getNamespaceConfig(body.namespaceId, orgId);
  if (!namespace) {
    return notFoundResponse("Namespace not found");
  }

  const tenantId = getTenantFromRequest(request);

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
    });
  } else {
    data = await queryVectorStoreV2(vectorStore, embedding.embedding, {
      topK: body.topK,
      minScore: body.minScore,
      filter: body.filter,
      includeMetadata: true,
      includeRelationships: body.includeRelationships,
    });
  }

  if (!data) {
    return makeApiErrorResponse({
      message: "Failed to parse chunks",
      status: 500,
    });
  }

  const newMessages = [
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
}
