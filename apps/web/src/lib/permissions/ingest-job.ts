import { db } from "@agentset/db";

import type { AuthenticatedRequest } from "../api-utils/auth";

export const canDeleteIngestJob = async (
  ingestJobId: string,
  req: AuthenticatedRequest,
) => {
  const ingestJob = await db.ingestJob.findUnique({
    where: {
      id: ingestJobId,
      namespace: {
        organization: {
          id: req.data.organizationId,
        },
      },
    },
  });

  return !!ingestJob;
};
