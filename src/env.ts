import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string(),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    RESEND_API_KEY: z.string(),

    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),

    QSTASH_URL: z.string().url(),
    QSTASH_TOKEN: z.string(),
    QSTASH_CURRENT_SIGNING_KEY: z.string(),
    QSTASH_NEXT_SIGNING_KEY: z.string(),

    DEFAULT_PINECONE_API_KEY: z.string(),
    DEFAULT_PINECONE_HOST: z.string().url(),

    DEFAULT_AZURE_BASE_URL: z.string().url(),
    DEFAULT_AZURE_API_KEY: z.string(),
    DEFAULT_AZURE_TEXT_3_LARGE_EMBEDDING_DEPLOYMENT: z.string(),
    DEFAULT_AZURE_TEXT_3_LARGE_EMBEDDING_VERSION: z.string().optional(),
    DEFAULT_AZURE_GPT_4O_DEPLOYMENT: z.string(),
    DEFAULT_AZURE_GPT_4O_VERSION: z.string().optional(),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,

    NODE_ENV: process.env.NODE_ENV,
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,

    DEFAULT_PINECONE_API_KEY: process.env.DEFAULT_PINECONE_API_KEY,
    DEFAULT_PINECONE_HOST: process.env.DEFAULT_PINECONE_INDEX,

    DEFAULT_AZURE_BASE_URL: process.env.DEFAULT_AZURE_BASE_URL,
    DEFAULT_AZURE_API_KEY: process.env.DEFAULT_AZURE_API_KEY,
    DEFAULT_AZURE_TEXT_3_LARGE_EMBEDDING_DEPLOYMENT:
      process.env.DEFAULT_AZURE_TEXT_3_LARGE_EMBEDDING_DEPLOYMENT,
    DEFAULT_AZURE_TEXT_3_LARGE_EMBEDDING_VERSION:
      process.env.DEFAULT_AZURE_TEXT_3_LARGE_EMBEDDING_VERSION,
    DEFAULT_AZURE_GPT_4O_DEPLOYMENT:
      process.env.DEFAULT_AZURE_GPT_4O_DEPLOYMENT,
    DEFAULT_AZURE_GPT_4O_VERSION: process.env.DEFAULT_AZURE_GPT_4O_VERSION,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
