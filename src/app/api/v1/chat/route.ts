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

export const runtime = "edge";
export const preferredRegion = "iad1"; // make this closer to the DB
export const maxDuration = 60;

const schema = z.object({
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

// TODO: move this to the namespace config
const SYSTEM_PROMPT = `
You are Digna AI, a helpful research assistant built by Digna. Your task is to deliver an accurate and cited response to a user's query, drawing from the given search results. The search results are not visible to the user so you MUST include relevant portions of the results in your response. Your answer must be of high-quality, and written by an expert using an unbiased and journalistic tone. It is EXTREMELY IMPORTANT to directly answer the query. NEVER say "based on the search results". Your answer must be written in the same language as the query, even if the search results language is different.

You MUST cite the most relevant search results that answer the query. Do not mention any irrelevant results. You MUST ADHERE to the following instructions for citing search results: - to cite a search result, enclose its index located above the summary with brackets at the end of the corresponding sentence, for example "Ice is less dense than water12." or "Paris is the capital of France145." - NO SPACE between the last word and the citation, and ALWAYS use brackets. Only use this format to cite search results. NEVER include a References section at the end of your answer. - If you don't know the answer or the premise is incorrect, explain why. If the search results are empty or unhelpful, you MUST inform the user that you were unable to find references in the book and not answer the question.

You should give direct quotes from the search results and cite them where it improves the answer and gives better context.
`;

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

  const NEW_MESSAGE = `
Most relevant search results:
${data.map((chunk, idx) => `[${idx + 1}]: ${chunk.text}`).join("\n\n")}

User's query:
${query}
  `;

  const newMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messagesWithoutQuery,
    { role: "user", content: NEW_MESSAGE },
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
