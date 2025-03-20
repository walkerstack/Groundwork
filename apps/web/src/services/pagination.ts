import { z } from "zod";

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  cursorDirection: z.enum(["forward", "backward"]).default("forward"),
  perPage: z.number().min(1).max(100).optional().default(30),
});

export const getPaginationArgs = (input: z.infer<typeof paginationSchema>) => {
  return {
    take: (input.perPage + 1) * (input.cursorDirection === "forward" ? 1 : -1),
    cursor: input.cursor ? { id: input.cursor } : undefined,
  };
};

export const paginateResults = <T extends { id: string }>(
  input: z.infer<typeof paginationSchema>,
  results: T[],
) => {
  return {
    records: results.slice(0, input.perPage),
    nextCursor:
      results.length > input.perPage
        ? (results[results.length - 1]?.id ?? null)
        : null,
  };
};
