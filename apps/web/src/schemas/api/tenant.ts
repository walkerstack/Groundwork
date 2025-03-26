import z from "@/lib/zod";

export const tenantHeaderSchema = z.object({
  "x-tenant-id": z
    .string()
    .optional()
    .describe(
      "The tenant id to use for the request. If not provided, the default tenant will be used.",
    ),
});
