import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import z from "@/lib/zod";
import { coreMessageSchema } from "ai";

import { baseQueryVectorStoreSchema, refineRereankLimit } from "./query";

export const chatSchema = refineRereankLimit(
  baseQueryVectorStoreSchema.extend({
    systemPrompt: z
      .string()
      .optional()
      .default(DEFAULT_SYSTEM_PROMPT.compile()),
    messages: z.array(coreMessageSchema),
    stream: z.boolean().optional().default(false),
  }),
);
