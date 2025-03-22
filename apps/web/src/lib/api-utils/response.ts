import { NextResponse } from "next/server";

export const makeApiErrorResponse = ({
  message,
  error,
  status = 500,
}: {
  message: string;
  error?: unknown;
  status?: number;
}) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: error ?? null,
    },
    { status },
  );
};

export const makeApiSuccessResponse = ({
  data,
  status = 200,
}: {
  data: unknown;
  status?: number;
}) => {
  return NextResponse.json({ success: true, data }, { status });
};

export const notFoundResponse = (message?: string) => {
  return makeApiErrorResponse({
    message: message ?? "Not found",
    status: 404,
  });
};

export const forbiddenResponse = (message?: string) => {
  return makeApiErrorResponse({
    message: message ?? "Forbidden",
    status: 403,
  });
};
