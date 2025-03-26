import { toSlug, validSlugRegex } from "@/lib/slug";
import z from "@/lib/zod";

const embeddingModelEnum = z.enum([
  "text-embedding-3-small",
  "text-embedding-3-large",
]);

export const embeddingConfigSchema = z
  .discriminatedUnion("provider", [
    z.object({
      provider: z.literal("OPENAI"),
      model: embeddingModelEnum,
      apiKey: z.string(),
    }),
    z.object({
      provider: z.literal("AZURE_OPENAI"),
      model: embeddingModelEnum,
      baseUrl: z
        .string()
        .url()
        .describe("The base URL of the Azure OpenAI API.")
        .openapi({
          example: `https://example.openai.azure.com/openai/deployments`,
        }),
      deployment: z
        .string()
        .describe("The deployment name of the Azure OpenAI API."),
      apiKey: z.string().describe("The API key for the Azure OpenAI API."),
      apiVersion: z
        .string()
        .optional()
        .describe("The API version for the Azure OpenAI API."),
    }),
  ])
  .describe(
    "The embedding model config. If not provided, our managed embedding model will be used. Note: You can't change the embedding model config after the namespace is created.",
  );

export const vectorStoreSchema = z
  .discriminatedUnion("provider", [
    z.object({
      provider: z.literal("PINECONE"),
      apiKey: z.string().describe("The API key for the Pinecone index."),
      indexHost: z
        .string()
        .url()
        .describe("The host of the Pinecone index.")
        .openapi({
          example: `https://example.svc.aped-1234-a56b.pinecone.io`,
        }),
    }),
  ])
  .describe(
    "The vector store config. If not provided, our managed vector store will be used. Note: You can't change the vector store config after the namespace is created.",
  );

export const NamespaceSchema = z
  .object({
    id: z.string().describe("The unique ID of the namespace."),
    name: z.string().describe("The name of the namespace."),
    slug: z.string().describe("The slug of the namespace."),
    organizationId: z
      .string()
      .describe("The ID of the organization that owns the namespace."),
    createdAt: z
      .date()
      .describe("The date and time the namespace was created."),
    embeddingConfig: embeddingConfigSchema.nullable().default(null),
    vectorStoreConfig: vectorStoreSchema.nullable().default(null),
  })
  .openapi({
    title: "Namespace",
  });

export const createNamespaceSchema = z.object({
  name: z.string().min(1).max(64),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(48, "Slug must be less than 48 characters")
    .transform((v) => toSlug(v))
    .refine((v) => validSlugRegex.test(v), { message: "Invalid slug format" }),
  embeddingConfig: embeddingConfigSchema.nullable().default(null),
  vectorStoreConfig: vectorStoreSchema.nullable().default(null),
});

export const updateNamespaceSchema = createNamespaceSchema
  .pick({
    name: true,
    slug: true,
  })
  .partial();
