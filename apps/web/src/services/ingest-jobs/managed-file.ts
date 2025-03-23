import { checkFileExists } from "@/lib/s3";
import { triggerIngestionJob } from "@/lib/workflow";

import type { IngestJob } from "@agentset/db";
import { db, IngestJobStatus } from "@agentset/db";

export const ingestManagedFile = async ({
  name,
  key,
  namespaceId,
  tenantId,
  config,
}: {
  name?: string;
  key: string;
  namespaceId: string;
  tenantId?: string;
  config?: NonNullable<IngestJob["config"]>;
}) => {
  const exists = await checkFileExists(key);
  if (!exists) {
    throw new Error("File does not exist");
  }

  const payload: PrismaJson.IngestJobPayload = {
    type: "MANAGED_FILE",
    name,
    key,
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
