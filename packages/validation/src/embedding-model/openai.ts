import z from "../zod";

export const openaiEmbeddingModelEnum = z.enum([
  "text-embedding-3-small",
  "text-embedding-3-large",
]);

export const OpenAIEmbeddingConfigSchema = z
  .object({
    provider: z.literal("OPENAI"),
    model: openaiEmbeddingModelEnum,
    apiKey: z.string(),
  })
  .openapi({
    title: "OpenAI Embedding Config",
  });
