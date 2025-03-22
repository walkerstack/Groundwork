import { makeApiSuccessResponse } from "@/lib/api-utils/response";
import { withNamespaceApiHandler } from "@/lib/api/handler";
import {
  getAllIngestJobs,
  getAllIngestJobsSchema,
} from "@/services/ingest-jobs/all";

export const GET = withNamespaceApiHandler(
  async ({ searchParams, namespace, tenantId }) => {
    const validatedBody = await getAllIngestJobsSchema.parseAsync(searchParams);

    const data = await getAllIngestJobs({
      ...validatedBody,
      namespaceId: namespace.id,
      tenantId,
    });

    return makeApiSuccessResponse({
      data,
    });
  },
);
