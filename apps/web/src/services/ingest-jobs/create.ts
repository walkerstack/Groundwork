import { checkFileExists } from "@/lib/s3";
import { triggerIngestionJob } from "@/lib/workflow";

import type { IngestJob } from "@agentset/db";
import { db, IngestJobStatus } from "@agentset/db";

export const createIngestJob = async ({
  namespaceId,
  organizationId,
  tenantId,
  config,
  payload,
}: {
  namespaceId: string;
  organizationId: string;
  tenantId?: string;
  payload: IngestJob["payload"];
  config?: NonNullable<IngestJob["config"]>;
}) => {
  let finalPayload: PrismaJson.IngestJobPayload | null = null;
  if (payload.type === "FILE") {
    finalPayload = {
      type: "FILE",
      ...(payload.name && { name: payload.name }),
      fileUrl: payload.fileUrl,
    };
  } else if (payload.type === "TEXT") {
    finalPayload = {
      type: "TEXT",
      ...(payload.name && { name: payload.name }),
      text: payload.text,
    };
  } else if (payload.type === "URLS") {
    const deduplicatedUrls = [...new Set(payload.urls)];
    finalPayload = {
      type: "URLS",
      urls: deduplicatedUrls,
    };
  } else if (payload.type === "MANAGED_FILE") {
    const exists = await checkFileExists(payload.key);
    if (!exists) {
      throw new Error("FILE_NOT_FOUND");
    }

    finalPayload = {
      type: "MANAGED_FILE",
      ...(payload.name && { name: payload.name }),
      key: payload.key,
    };
  }

  if (!finalPayload) {
    throw new Error("INVALID_PAYLOAD");
  }

  const [job] = await db.$transaction([
    db.ingestJob.create({
      data: {
        namespace: { connect: { id: namespaceId } },
        tenantId,
        status: IngestJobStatus.QUEUED,
        payload: finalPayload,
        config,
      },
    }),
    db.organization.update({
      where: { id: organizationId },
      data: {
        totalIngestJobs: { increment: 1 },
      },
      select: { id: true },
    }),
  ]);

  const { workflowRunId } = await triggerIngestionJob({ jobId: job.id });

  await db.ingestJob.update({
    where: { id: job.id },
    data: { workflowRunsIds: { push: workflowRunId } },
    select: { id: true },
  });

  return job;
};
