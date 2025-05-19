import z from "@/lib/zod";
import { coreMessageSchema } from "ai";

export const hostingChatSchema = z.object({
  messages: z.array(coreMessageSchema),
});
