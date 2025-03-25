import { NextResponse } from "next/server";

export const makeApiSuccessResponse = ({
  data,
  status = 200,
}: {
  data: unknown;
  status?: number;
}) => {
  return NextResponse.json({ success: true, data }, { status });
};
