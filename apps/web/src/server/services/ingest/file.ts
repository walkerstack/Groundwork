import { triggerIngestionJob } from "@/lib/workflow";

import type { IngestJob } from "@agentset/db";
import { db, IngestJobStatus } from "@agentset/db";

export const ingestFile = async ({
  name,
  fileUrl,
  namespaceId,
  tenantId,
  config,
}: {
  name?: string;
  fileUrl: string;
  namespaceId: string;
  tenantId?: string;
  config?: NonNullable<IngestJob["config"]>;
}) => {
  const job = await db.ingestJob.create({
    data: {
      namespace: { connect: { id: namespaceId } },
      tenantId,
      config,
      status: IngestJobStatus.QUEUED,
      payload: {
        type: "FILE",
        name,
        fileUrl,
      },
    },
  });

  const { workflowRunId } = await triggerIngestionJob({ jobId: job.id });

  await db.ingestJob.update({
    where: { id: job.id },
    data: { workflowRunsIds: { push: workflowRunId } },
    select: { id: true },
  });

  return job;
};
