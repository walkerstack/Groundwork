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

export const validateBody = async <T extends z.ZodSchema>(
  request: NextRequest,
  schema: T,
  type: "body" | "query" = "body",
) => {
  const body = await tryCatch(
    type === "body"
      ? request.json()
      : () => Object.fromEntries(request.nextUrl.searchParams.entries()),
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
