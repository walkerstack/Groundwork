import { z } from "zod";

import { db } from "@agentset/db";

export const getIngestJobSchema = z.object({
  jobId: z.string(),
});

export const getIngestJob = async (
  body: z.infer<typeof getIngestJobSchema> & {
    namespaceId?: string;
  },
) => {
  const ingestJob = await db.ingestJob.findUnique({
    where: {
      id: body.jobId,
      namespaceId: body.namespaceId,
    },
  });

  return ingestJob;
};
