import { makeApiSuccessResponse } from "@/lib/api-utils/response";
import { parseRequestBody } from "@/lib/api/body";
import { withApiHandler } from "@/lib/api/handler";
import { createNamespaceSchema } from "@/schemas/api/namespace";
import { createNamespace } from "@/services/namespaces/create";

import { db } from "@agentset/db";

export const GET = withApiHandler(async ({ organization }) => {
  const namespaces = await db.namespace.findMany({
    where: {
      organizationId: organization.id,
    },
  });

  return makeApiSuccessResponse({
    data: namespaces,
  });
});

export const POST = withApiHandler(async ({ organization, req }) => {
  const body = await parseRequestBody(req);
  const parsed = await createNamespaceSchema.parseAsync(body);

  // TODO: check apiScope
  const namespace = await createNamespace({
    ...parsed,
    organizationId: organization.id,
  });

  return makeApiSuccessResponse({
    data: namespace,
  });
});
