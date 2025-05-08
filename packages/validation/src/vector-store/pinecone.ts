import z from "../zod";

export const PineconeVectorStoreConfigSchema = z
  .object({
    provider: z.literal("PINECONE"),
    apiKey: z.string().describe("The API key for the Pinecone index."),
    indexHost: z
      .string()
      .url()
      .describe("The host of the Pinecone index.")
      .openapi({
        example: `https://example.svc.aped-1234-a56b.pinecone.io`,
      }),
  })
  .openapi({
    title: "Pinecone Config",
  });
