import z from "../zod";
import { AzureEmbeddingConfigSchema } from "./azure";
import { OpenAIEmbeddingConfigSchema } from "./openai";

export const EmbeddingConfigSchema = z
  .discriminatedUnion("provider", [
    OpenAIEmbeddingConfigSchema,
    AzureEmbeddingConfigSchema,
  ])
  .describe(
    "The embedding model config. If not provided, our managed embedding model will be used. Note: You can't change the embedding model config after the namespace is created.",
  );

export type EmbeddingConfig = z.infer<typeof EmbeddingConfigSchema>;
