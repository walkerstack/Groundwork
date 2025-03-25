import { parseRequestBody } from "@/lib/api/body";
import { withApiHandler } from "@/lib/api/handler";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { createNamespaceSchema } from "@/schemas/api/namespace";
import { createNamespace } from "@/services/namespaces/create";

import { db } from "@agentset/db";

export const GET = withApiHandler(async ({ organization, headers }) => {
  const namespaces = await db.namespace.findMany({
    where: {
      organizationId: organization.id,
    },
  });

  return makeApiSuccessResponse({
    data: namespaces,
    headers,
  });
});

export const POST = withApiHandler(async ({ organization, req, headers }) => {
  const parsed = await createNamespaceSchema.parseAsync(
    await parseRequestBody(req),
  );

  // TODO: check apiScope
  const namespace = await createNamespace({
    ...parsed,
    organizationId: organization.id,
  });

  return makeApiSuccessResponse({
    data: namespace,
    headers,
  });
});
