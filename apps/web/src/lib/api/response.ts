import { NextResponse } from "next/server";

export const makeApiSuccessResponse = ({
  data,
  status = 200,
  headers,
  nextCursor,
}: {
  data: unknown;
  status?: number;
  headers?: Record<string, string>;
  nextCursor?: string | null;
}) => {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(typeof nextCursor !== "undefined"
        ? { pagination: { nextCursor } }
        : {}),
    },
    { status, headers },
  );
};
