import { AgentsetApiError } from "@/lib/api/errors";
import { withApiHandler } from "@/lib/api/handler";
import { prefixId } from "@/lib/api/ids";
import { makeApiSuccessResponse } from "@/lib/api/response";
import { parseRequestBody } from "@/lib/api/utils";
import {
  createNamespaceSchema,
  NamespaceSchema,
} from "@/schemas/api/namespace";
import { createNamespace } from "@/services/namespaces/create";

import { db, Prisma } from "@agentset/db";

export const GET = withApiHandler(async ({ organization, headers }) => {
  const namespaces = await db.namespace.findMany({
    where: {
      organizationId: organization.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return makeApiSuccessResponse({
    data: namespaces.map((namespace) =>
      NamespaceSchema.parse({
        ...namespace,
        id: prefixId(namespace.id, "ns_"),
        organizationId: prefixId(namespace.organizationId, "org_"),
      }),
    ),
    headers,
  });
});

export const POST = withApiHandler(async ({ organization, req, headers }) => {
  const parsed = await createNamespaceSchema.parseAsync(
    await parseRequestBody(req),
  );

  try {
    // TODO: check apiScope
    const namespace = await createNamespace({
      ...parsed,
      organizationId: organization.id,
    });

    return makeApiSuccessResponse({
      data: NamespaceSchema.parse({
        ...namespace,
        id: prefixId(namespace.id, "ns_"),
        organizationId: prefixId(namespace.organizationId, "org_"),
      }),
      headers,
      status: 201,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AgentsetApiError({
        code: "conflict",
        message: `The slug "${parsed.slug}" is already in use.`,
      });
    }

    // let the default error handler handle the error
    throw error;
  }
});
