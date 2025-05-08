import z from "../zod";

export const googleEmbeddingModelEnum = z.enum(["text-embedding-004"]);

export const GoogleEmbeddingConfigSchema = z
  .object({
    provider: z.literal("GOOGLE"),
    model: googleEmbeddingModelEnum,
    apiKey: z.string(),
  })
  .openapi({
    title: "Google Embedding Config",
  });
