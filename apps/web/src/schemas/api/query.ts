import z from "@/lib/zod";

export const baseQueryVectorStoreSchema = z.object({
  query: z.string(),
  topK: z.number().min(1).max(100).optional().default(10),
  rerank: z.boolean().optional().default(true),
  rerankLimit: z.number().min(1).max(100).optional(),
  filter: z.record(z.string(), z.any()).optional(),
  minScore: z.number().min(0).max(1).optional(),
  includeRelationships: z.boolean().optional().default(false),
  includeMetadata: z.boolean().optional().default(true),
});

export const refineRereankLimit = <
  T extends (typeof baseQueryVectorStoreSchema)["shape"] & z.ZodRawShape,
  Out extends {
    rerankLimit?: number;
    topK: number;
    [key: string]: any;
  },
>(
  schema: z.ZodObject<T, "strip", z.ZodTypeAny, Out>,
) => {
  return schema.superRefine((val, ctx) => {
    if (val.rerankLimit && val.rerankLimit > val.topK) {
      ctx.addIssue({
        path: ["rerankLimit"],
        code: z.ZodIssueCode.too_big,
        message: "rerankLimit cannot be larger than topK",
        inclusive: true,
        type: "number",
        maximum: val.topK,
      });
      return false;
    }

    return true;
  });
};

export const queryVectorStoreSchema = refineRereankLimit(
  baseQueryVectorStoreSchema,
);
