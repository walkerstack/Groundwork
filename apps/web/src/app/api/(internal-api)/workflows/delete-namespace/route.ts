import type { DeleteNamespaceBody } from "@/lib/workflow";
import { chunkArray } from "@/lib/functions";
import {
  qstashClient,
  qstashReceiver,
  triggerDeleteIngestJob,
} from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";

import { db } from "@agentset/db";

const BATCH_SIZE = 30;
export const { POST } = serve<DeleteNamespaceBody>(
  async (context) => {
    const { namespaceId, deleteOrgWhenDone } = context.requestPayload;

    const namespace = await context.run("get-namespace", async () => {
      const job = await db.namespace.findUnique({
        where: { id: namespaceId },
        select: {
          id: true,
        },
      });

      if (!job) {
        throw new Error("Namespace job not found");
      }

      return job;
    });

    // TODO: update status to deleting
    // await context.run("update-status-deleting", async () => {
    //   await db.ingestJob.update({
    //     where: { id: ingestJob.id },
    //     data: {
    //       status: IngestJobStatus.DELETING,
    //     },
    //     select: { id: true },
    //   });
    // });

    const ingestJobs = await context.run("get-ingest-jobs", async () => {
      return await db.ingestJob.findMany({
        where: { namespaceId: namespace.id },
        select: { id: true },
      });
    });

    const batches = chunkArray(ingestJobs, BATCH_SIZE);
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]!;
      await context.run(`enqueue-ingest-jobs-deletion-${i}`, async () => {
        await Promise.all(
          batch.map((ingestJob) =>
            triggerDeleteIngestJob({
              jobId: ingestJob.id,
              deleteNamespaceWhenDone: true,
              deleteOrgWhenDone,
            }),
          ),
        );
      });
    }
  },
  {
    qstashClient: qstashClient,
    receiver: qstashReceiver,
    flowControl: { key: "delete-namespace", parallelism: 3, ratePerSecond: 3 },
  },
);
