import { NextResponse } from "next/server";
import { handleAndReturnErrorResponse } from "@/lib/api/errors";
import { verifyQstashSignature } from "@/lib/cron/verify-qstash";
import { log } from "@/lib/log";

import { updateUsage } from "./utils";

/*
  This route is used to update the usage stats of each organization.
  Runs once every day at noon UTC (0 12 * * *)
*/
export async function POST(req: Request) {
  try {
    await verifyQstashSignature({
      req,
      rawBody: await req.text(),
    });

    await updateUsage();

    return NextResponse.json({
      response: "success",
    });
  } catch (error: any) {
    await log({
      message: `Error updating usage: ${error.message}`,
      type: "cron",
    });

    return handleAndReturnErrorResponse(error);
  }
}
