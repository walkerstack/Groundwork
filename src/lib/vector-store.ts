import { Namespace } from "@prisma/client";
import { env } from "@/env";
import { Pinecone } from "@pinecone-database/pinecone";
import { z } from "zod";

type VectorStore = Awaited<ReturnType<typeof getNamespaceVectorStore>>;

export const getNamespaceVectorStore = async (
  namespace: Pick<Namespace, "vectorStoreConfig" | "id">,
  tenant?: string,
) => {
  const config = namespace.vectorStoreConfig;

  const tenantId = tenant ?? `agentset:${namespace.id}`;

  // TODO: handle different embedding models
  if (!config) {
    const pc = new Pinecone({
      apiKey: env.DEFAULT_PINECONE_API_KEY,
    });

    return pc.Index(env.DEFAULT_PINECONE_INDEX).namespace(tenantId);
  }

  switch (config.provider) {
    case "PINECONE": {
      const { apiKey, indexName } = config;
      const pc = new Pinecone({ apiKey });

      return pc.Index(indexName).namespace(tenantId);
    }

    default: {
      // This exhaustive check ensures TypeScript will error if a new provider
      // is added without handling it in the switch statement
      const _exhaustiveCheck: never = config.provider;
      throw new Error(`Unknown vector store provider: ${_exhaustiveCheck}`);
    }
  }
};

const jsonArraySchema = (type: z.ZodType) =>
  z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val),
    z.array(type),
  );

const nodeMetadataSchema = z.object({
  link_texts: jsonArraySchema(z.string()).optional(),
  link_urls: jsonArraySchema(z.string()).optional(),
  languages: jsonArraySchema(z.string()).optional(),
  file_directory: z.string(),
  filename: z.string(),
  filetype: z.string(),
  sequence_number: z.number().optional(),
});

const nodeSchema = z.object({
  id: z.string(),
  score: z.number(),
  metadata: nodeMetadataSchema,
  // embedding: z.any().nullable(),
  // excluded_embed_metadata_keys: z.array(z.string()),
  // excluded_llm_metadata_keys: z.array(z.string()),
  relationships: z
    .record(
      z.string(),
      z.object({
        node_id: z.string(),
        node_type: z.string(),
        metadata: nodeMetadataSchema,
        hash: z.string(),
        class_name: z.string(),
      }),
    )
    .optional(),
  metadata_template: z.string(),
  metadata_separator: z.string(),
  text: z.string(),
  mimetype: z.string(),
  start_char_idx: z.number().nullable(),
  end_char_idx: z.number().nullable(),
  metadata_seperator: z.string(),
  text_template: z.string(),
  class_name: z.string(),
});

export const queryVectorStore = async <IncludeMetadata extends boolean>(
  vectorStore: VectorStore,
  embedding: number[],
  options: {
    topK: number;
    minScore?: number;
    filter?: Record<string, string>;
    includeMetadata?: IncludeMetadata;
    includeRelationships?: boolean;
  },
) => {
  // TODO: track usage
  let { matches } = await vectorStore.query({
    vector: embedding,
    topK: options.topK,
    filter: options.filter,
    includeMetadata: options.includeMetadata,
  });

  if (options.minScore !== undefined) {
    matches = matches.filter(
      (match) => match.score && match.score >= options.minScore!,
    );
  }

  if (!options.includeMetadata) {
    return matches.map((match) => ({
      id: match.id,
      score: match.score,
    })) as unknown as IncludeMetadata extends true
      ? never
      : {
          id: string;
          score?: number;
        };
  }

  try {
    const parsedNodes = await z.array(nodeSchema).parseAsync(
      matches.map((match) => ({
        id: match.id,
        score: match.score,
        ...JSON.parse(match.metadata!["_node_content"] as string),
      })),
    );
    return parsedNodes.map((node) => {
      const {
        start_char_idx: _start_char_idx,
        end_char_idx: _end_char_idx,
        metadata_seperator: _metadata_seperator,
        text_template: _text_template,
        class_name: _class_name,
        metadata_template: _metadata_template,
        metadata_separator: _metadata_separator,
        ...rest
      } = node;

      return {
        ...rest,
        relationships: options.includeRelationships
          ? node.relationships
          : undefined,
        metadata: options.includeMetadata ? node.metadata : undefined,
      };
    });
  } catch (e) {
    console.error(e);
    return null;
  }
};
