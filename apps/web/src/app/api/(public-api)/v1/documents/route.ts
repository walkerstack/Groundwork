import type { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api-utils/auth";
import { makeApiSuccessResponse } from "@/lib/api-utils/response";
import { validateBody } from "@/lib/api-utils/validation";
import {
  getAllDocuments,
  getAllDocumentsSchema,
} from "@/services/documents/all";

export async function GET(request: NextRequest) {
  const validatedBody = await validateBody(
    request,
    getAllDocumentsSchema,
    "query",
  );
  if (validatedBody.error) return validatedBody.error;
  const body = validatedBody.data;

  const authResult = await authenticateRequest(request, body.namespaceId);
  if (authResult.error) return authResult.error;

  const data = await getAllDocuments(body);

  return makeApiSuccessResponse({
    data,
  });
}
