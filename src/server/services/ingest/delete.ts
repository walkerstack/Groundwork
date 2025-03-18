import { triggerDeleteIngestJob } from "@/lib/workflow";
import { db } from "@/server/db";
import { IngestJobStatus } from "@prisma/client";

export const deleteIngestJob = async ({
  jobId,
  userId,
}: {
  jobId: string;
  userId?: string;
}) => {
  const ingestJob = await db.ingestJob.findUnique({
    where: {
      id: jobId,
      ...(userId
        ? {
            namespace: {
              organization: {
                members: {
                  some: { userId, role: { in: ["admin", "owner"] } },
                },
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  if (!ingestJob) return null;

  await db.ingestJob.update({
    where: { id: ingestJob.id },
    data: {
      status: IngestJobStatus.QUEUED_FOR_DELETE,
    },
    select: { id: true },
  });

  const { workflowRunId } = await triggerDeleteIngestJob({ jobId });
  await db.ingestJob.update({
    where: { id: ingestJob.id },
    data: {
      workflowRunsIds: { push: workflowRunId },
    },
    select: { id: true },
  });

  return ingestJob;
};
