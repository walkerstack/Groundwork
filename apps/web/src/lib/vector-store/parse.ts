import { z } from "zod";
import type { getNamespaceVectorStore } from ".";

type VectorStore = Awaited<ReturnType<typeof getNamespaceVectorStore>>;

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

const excludeKeys = <T extends Record<string, unknown>, K extends string[]>(
  obj: T,
  keys: K,
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key)),
  ) as Omit<T, (typeof keys)[number]>;
};

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
      matches.map((match) => {
        if (!match.metadata) {
          throw new Error("No metadata found");
        }

        return {
          id: match.id,
          score: match.score,
          ...(JSON.parse(
            (match.metadata as unknown as { _node_content: string })[
              "_node_content"
            ],
          ) as Record<string, unknown>),
        };
      }),
    );
    return parsedNodes.map((node) => {
      const rest = excludeKeys(node, [
        "start_char_idx",
        "end_char_idx",
        "metadata_seperator",
        "text_template",
        "metadata_template",
        "class_name",
        "metadata_separator",
      ] as const);

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
