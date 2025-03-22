import z from "@/lib/zod";

export const createNamespaceSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
});
