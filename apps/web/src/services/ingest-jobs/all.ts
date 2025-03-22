import { z } from "zod";

import { db, IngestJobStatus } from "@agentset/db";

import {
  getPaginationArgs,
  paginateResults,
  paginationSchema,
} from "../pagination";

export const getAllIngestJobsSchema = paginationSchema.extend({
  statuses: z.array(z.nativeEnum(IngestJobStatus)).optional(),
  orderBy: z.enum(["createdAt"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const getAllIngestJobs = async (
  input: z.infer<typeof getAllIngestJobsSchema> & {
    namespaceId: string;
    tenantId?: string;
  },
) => {
  const ingestJobs = await db.ingestJob.findMany({
    where: {
      namespaceId: input.namespaceId,
      tenantId: input.tenantId,
      ...(input.statuses &&
        input.statuses.length > 0 && {
          status: { in: input.statuses },
        }),
    },
    orderBy: [
      {
        [input.orderBy]: input.order,
      },
    ],
    ...getPaginationArgs(input),
  });

  return paginateResults(input, ingestJobs);
};
