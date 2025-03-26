import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import z from "@/lib/zod";

import { NodeSchema } from "./node";
import { baseQueryVectorStoreSchema, refineRereankLimit } from "./query";

export const MessageSchema = z
  .discriminatedUnion("role", [
    z.object({
      role: z.literal("user"),
      content: z.string(),
    }),
    z.object({
      role: z.literal("assistant"),
      content: z.string(),
    }),
  ])
  .openapi({
    title: "Message",
  });

export const chatSchema = refineRereankLimit(
  baseQueryVectorStoreSchema.extend({
    systemPrompt: z
      .string()
      .optional()
      .default(DEFAULT_SYSTEM_PROMPT.compile())
      .describe(
        "The system prompt to use for the chat. Defaults to the default system prompt.",
      ),
    messages: z
      .array(MessageSchema)
      .describe(
        "The messages to use for the chat. Defaults to an empty array.",
      ),
    stream: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether to stream the response. Defaults to `false`."),
  }),
);

export const chatResponseSchema = z.object({
  text: z.string().describe("The text of the response."),
  sources: z.array(NodeSchema).describe("The sources of the response."),
});
