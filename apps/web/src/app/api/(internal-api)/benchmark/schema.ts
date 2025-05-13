import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import z from "@/lib/zod";
import {
  baseQueryVectorStoreSchema,
  refineRereankLimit,
} from "@/schemas/api/query";

export const chatSchema = refineRereankLimit(
  baseQueryVectorStoreSchema.omit({ query: true }).extend({
    systemPrompt: z
      .string()
      .optional()
      .default(DEFAULT_SYSTEM_PROMPT.compile())
      .describe(
        "The system prompt to use for the chat. Defaults to the default system prompt.",
      ),
    message: z.string(),
    temperature: z.number().optional(),
    mode: z.enum(["normal", "agentic"]).optional(),
  }),
);
