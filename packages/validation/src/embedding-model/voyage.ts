import z from "../zod";

export const voyageEmbeddingModelEnum = z.enum([
  "voyage-3-large",
  "voyage-3",
  "voyage-3-lite",
  "voyage-code-3",
  "voyage-finance-2",
  "voyage-law-2",
]);

export const VoyageEmbeddingConfigSchema = z
  .object({
    provider: z.literal("VOYAGE"),
    model: voyageEmbeddingModelEnum,
    apiKey: z.string(),
  })
  .openapi({
    title: "Voyage Embedding Config",
  });
