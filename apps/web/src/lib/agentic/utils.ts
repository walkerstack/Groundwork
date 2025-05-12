import type { CoreMessage, LanguageModelV1 } from "ai";
import { generateText } from "ai";
import { z } from "zod";

import type { QueryVectorStoreResult } from "../vector-store/parse";
import { EVALUATE_QUERIES_PROMPT, GENERATE_QUERIES_PROMPT } from "./prompts";

const schema = z.object({
  queries: z.array(
    z.object({
      type: z.enum(["keyword", "semantic"]),
      query: z.string(),
    }),
  ),
});

export type Queries = z.infer<typeof schema>["queries"];

export const generateQueries = async (
  model: LanguageModelV1,
  messages: CoreMessage[],
  oldQueries: Queries,
) => {
  const queriesResult = await generateText({
    model,
    system: GENERATE_QUERIES_PROMPT(oldQueries),
    temperature: 0,
    messages,
  });

  return schema.parse(JSON.parse(queriesResult.text)).queries;
};

const evalSchema = z.object({
  canAnswer: z.boolean(),
});

export const evaluateQueries = async (
  model: LanguageModelV1,
  messages: CoreMessage[],
  sources: QueryVectorStoreResult["results"],
) => {
  const evaluateQueriesResult = await generateText({
    model,
    system: EVALUATE_QUERIES_PROMPT,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `
Chat history:
${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}

Retrieved sources:
${sources.map((s, idx) => `<source_${idx}>\n${s.text}\n</source_${idx}>`).join("\n\n")}
        `,
      },
    ],
  });

  return evalSchema.parse(JSON.parse(evaluateQueriesResult.text)).canAnswer;
};
