import type { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api-utils/auth";
import { makeApiSuccessResponse } from "@/lib/api-utils/response";
import { validateBody } from "@/lib/api-utils/validation";
import {
  getAllIngestJobs,
  getAllIngestJobsSchema,
} from "@/services/ingest-jobs/all";

export async function GET(request: NextRequest) {
  const validatedBody = await validateBody(
    request,
    getAllIngestJobsSchema,
    "query",
  );
  if (validatedBody.error) return validatedBody.error;
  const body = validatedBody.data;

  const authResult = await authenticateRequest(request, body.namespaceId);
  if (authResult.error) return authResult.error;

  const data = await getAllIngestJobs(body);

  return makeApiSuccessResponse({
    data,
  });
}
