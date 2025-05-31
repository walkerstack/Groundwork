import z from "@/lib/zod";

export const hostingSearchSchema = z.object({
  query: z.string(),
});
