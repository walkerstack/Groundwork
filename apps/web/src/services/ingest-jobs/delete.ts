import { triggerDeleteIngestJob } from "@/lib/workflow";

import { db, IngestJobStatus } from "@agentset/db";

export const deleteIngestJob = async (jobId: string) => {
  const job = await db.ingestJob.update({
    where: { id: jobId },
    data: {
      status: IngestJobStatus.QUEUED_FOR_DELETE,
    },
  });

  const { workflowRunId } = await triggerDeleteIngestJob({ jobId: job.id });
  await db.ingestJob.update({
    where: { id: job.id },
    data: {
      workflowRunsIds: { push: workflowRunId },
    },
    select: { id: true },
  });

  return job;
};
