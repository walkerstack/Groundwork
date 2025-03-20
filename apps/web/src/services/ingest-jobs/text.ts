import { triggerIngestionJob } from "@/lib/workflow";

import type { IngestJob } from "@agentset/db";
import { db, IngestJobStatus } from "@agentset/db";

export const ingestText = async ({
  name,
  text,
  namespaceId,
  tenantId,
  config,
}: {
  name?: string;
  text: string;
  namespaceId: string;
  tenantId?: string;
  config?: NonNullable<IngestJob["config"]>;
}) => {
  const payload: PrismaJson.IngestJobPayload = {
    type: "TEXT",
    name,
    text,
  };

  const job = await db.ingestJob.create({
    data: {
      namespace: { connect: { id: namespaceId } },
      tenantId,
      config,
      status: IngestJobStatus.QUEUED,
      payload,
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
