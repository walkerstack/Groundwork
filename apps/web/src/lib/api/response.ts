import { NextResponse } from "next/server";

export const makeApiSuccessResponse = ({
  data,
  status = 200,
  headers,
}: {
  data: unknown;
  status?: number;
  headers?: Record<string, string>;
}) => {
  return NextResponse.json({ success: true, data }, { status, headers });
};
