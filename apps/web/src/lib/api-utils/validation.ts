import type { NextRequest } from "next/server";
import type { z } from "zod";

import { tryCatch } from "../error";
import { makeApiErrorResponse } from "./response";

const makeErrorResponse = (error?: z.ZodError) =>
  makeApiErrorResponse({
    status: 400,
    message: "Invalid request body",
    error: error?.flatten().fieldErrors,
  });

export const validateRequestNamespace = (request: NextRequest) => {
  const namespaceId = request.nextUrl.searchParams.get("namespaceId");
  if (!namespaceId) {
    return {
      error: makeApiErrorResponse({
        status: 400,
        message: "Namespace ID is required",
      }),
      data: null,
    };
  }

  return {
    error: null,
    data: {
      namespaceId,
    },
  };
};

export const validateBody = async <T extends z.ZodSchema>(
  request: NextRequest,
  schema: T,
  typeOrBody: "body" | "query" | object = "body",
) => {
  const body = await tryCatch(
    typeof typeOrBody === "string"
      ? typeOrBody === "body"
        ? request.json()
        : () => Object.fromEntries(request.nextUrl.searchParams.entries())
      : () => typeOrBody,
  );

  if (body.error) {
    return {
      error: makeErrorResponse(),
      data: null,
    };
  }

  const result = await schema.safeParseAsync(body.data);

  if (!result.success) {
    return {
      error: makeErrorResponse(result.error),
      data: null,
    };
  }

  return {
    error: null,
    data: result.data as z.infer<T>,
  };
};
