import { triggerDeleteIngestJob } from "@/lib/workflow";
import { z } from "zod";

import { db, IngestJobStatus } from "@agentset/db";

export const deleteIngestJobSchema = z.object({
  jobId: z.string(),
});

export const deleteIngestJob = async ({
  jobId,
}: z.infer<typeof deleteIngestJobSchema>) => {
  const job = await db.ingestJob.update({
    where: { id: jobId },
    data: {
      status: IngestJobStatus.QUEUED_FOR_DELETE,
    },
    select: { id: true },
  });

  const { workflowRunId } = await triggerDeleteIngestJob({ jobId: job.id });
  const updatedJob = await db.ingestJob.update({
    where: { id: job.id },
    data: {
      workflowRunsIds: { push: workflowRunId },
    },
    select: { id: true },
  });

  return updatedJob;
};
