import { getApiKeyScopeAndOrganizationId, getNamespaceConfig } from "@/lib/api";
import type { Session } from "@/lib/auth-types";
import { getNamespaceEmbeddingModel } from "@/lib/embedding";
import { getNamespaceLanguageModel } from "@/lib/llm";
import { supabase } from "@/lib/supabase";
import { getNamespaceVectorStore, queryVectorStore } from "@/lib/vector-store";
import {
  type JSONValue,
  createDataStreamResponse,
  embed,
  generateText,
  streamText,
} from "ai";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_SYSTEM_PROMPT, NEW_MESSAGE_PROMPT } from "./prompts";

export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB
export const maxDuration = 60;

const schema = z.object({
  systemPrompt: z.string().optional().default(DEFAULT_SYSTEM_PROMPT),
  messages: z.array(z.any()),
  stream: z.boolean().optional().default(false),
  namespaceId: z.string(),
  topK: z.number().min(1).max(100).optional().default(10),
  filter: z.record(z.string(), z.any()).optional(),
  minScore: z.number().min(0).max(1).optional(),
  includeRelationships: z.boolean().optional().default(false),
  includeMetadata: z.boolean().optional().default(true),
  auth: z.boolean().optional().default(false),
  organizationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const result = await schema.safeParseAsync(await request.json());
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const query =
    result.data.messages.length > 0
      ? result.data.messages[result.data.messages.length - 1].content
      : null;

  if (!query) {
    return NextResponse.json(
      { success: false, message: "No query provided" },
      { status: 400 },
    );
  }

  const messagesWithoutQuery = result.data.messages.slice(0, -1);

  let orgId: string;

  if (result.data.auth) {
    let session: Session | null = null;

    try {
      const resp = await fetch(
        `${request.nextUrl.origin}/api/auth/get-session`,
        {
          headers: {
            cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
          },
        },
      );

      if (!resp.ok) {
        throw new Error("Failed to fetch session");
      }

      session = (await resp.json()) as Session;
    } catch (error) {}
    if (!session || !result.data.organizationId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const member = await supabase
      .from("member")
      .select("id")
      .eq("organizationId", result.data.organizationId)
      .eq("userId", session.user.id)
      .single();

    if (!member.data) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    orgId = result.data.organizationId;
  } else {
    const _apiKey = request.headers.get("Authorization");
    const apiKey = _apiKey?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "Invalid API key" },
        { status: 401 },
      );
    }

    const orgApiKey = await getApiKeyScopeAndOrganizationId(apiKey);
    if (!orgApiKey) {
      return NextResponse.json(
        { success: false, message: "Invalid API key" },
        { status: 401 },
      );
    }
    orgId = orgApiKey.organizationId;
  }

  const namespace = await getNamespaceConfig(result.data.namespaceId, orgId);

  if (!namespace) {
    return NextResponse.json(
      { success: false, message: "Namespace not found" },
      { status: 404 },
    );
  }

  // TODO: if the embedding model is managed, track the usage
  const [embeddingModel, vectorStore, languageModel] = await Promise.all([
    getNamespaceEmbeddingModel(namespace),
    getNamespaceVectorStore(
      namespace,
      namespace.id === "cm7zzvk4w0001ri45hfl7lkyo"
        ? "agentset:digna"
        : undefined,
    ),
    getNamespaceLanguageModel(), // TODO: pass namespace config
  ]);

  const embedding = await embed({
    model: embeddingModel,
    value: query,
  });

  // TODO: track the usage
  const data = await queryVectorStore(vectorStore, embedding.embedding, {
    topK: result.data.topK,
    minScore: result.data.minScore,
    filter: result.data.filter,
    includeMetadata: true,
    includeRelationships: result.data.includeRelationships,
  });

  if (!data) {
    return NextResponse.json({
      success: false,
      message: "Failed to parse chunks",
    });
  }

  const newMessages = [
    { role: "system", content: result.data.systemPrompt },
    ...messagesWithoutQuery,
    {
      role: "user",
      content: NEW_MESSAGE_PROMPT.replace(
        "{{chunks}}",
        data.map((chunk, idx) => `[${idx + 1}]: ${chunk.text}`).join("\n\n"),
      ).replace("{{query}}", query as string),
    },
  ];

  if (result.data.stream) {
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

  return NextResponse.json({
    text: response.text,
    sources: data,
  });
}
