import { AgentsetApiError } from "@/lib/api/errors";
import { withNamespaceApiHandler } from "@/lib/api/handler";
import { makeApiSuccessResponse } from "@/lib/api/response";
import {
  deleteIngestJob,
  deleteIngestJobSchema,
} from "@/services/ingest-jobs/delete";
import { getIngestJob, getIngestJobSchema } from "@/services/ingest-jobs/get";

import { db } from "@agentset/db";

export const GET = withNamespaceApiHandler(
  async ({ params, namespace, headers }) => {
    const jobId = params.jobId;
    const body = await getIngestJobSchema.parseAsync({
      jobId,
    });

    const data = await getIngestJob({ ...body, namespaceId: namespace.id });

    return makeApiSuccessResponse({
      data,
      headers,
    });
  },
);

export const DELETE = withNamespaceApiHandler(
  async ({ params, namespace, headers }) => {
    const jobId = params.jobId;
    const body = await deleteIngestJobSchema.parseAsync({
      jobId,
    });

    const ingestJob = await db.ingestJob.findUnique({
      where: {
        id: body.jobId,
        namespaceId: namespace.id,
      },
      select: {
        id: true,
      },
    });

    if (!ingestJob)
      throw new AgentsetApiError({
        code: "not_found",
        message: "Ingest job not found",
      });

    const data = await deleteIngestJob(body);

    return makeApiSuccessResponse({
      data,
      headers,
    });
  },
);
