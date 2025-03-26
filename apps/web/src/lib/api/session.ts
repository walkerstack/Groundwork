import type { NextRequest } from "next/server";

import type { Namespace } from "@agentset/db";
import { db } from "@agentset/db";

import type { Session } from "../auth-types";
import { AgentsetApiError } from "../api/errors";

type AuthenticateSessionResult<T extends string | undefined> = T extends string
  ? {
      namespace: Namespace;
      session: Session;
    }
  : { session: Session };

export const authenticateRequestSession = async <T extends string | undefined>(
  request: NextRequest,
  namespaceId?: T,
): Promise<AuthenticateSessionResult<T>> => {
  let session: Session | null = null;
  try {
    const resp = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
      },
    });

    if (!resp.ok) {
      throw new Error("Failed to fetch session");
    }

    session = (await resp.json()) as Session;
  } catch {
    /* empty */
  }

  if (!session) {
    throw new AgentsetApiError({
      code: "unauthorized",
      message: "Unauthorized",
    });
  }

  if (!namespaceId) {
    return { session } as T extends string
      ? {
          namespace: NonNullable<
            Awaited<ReturnType<typeof db.namespace.findUnique>>
          >;
          session: Session;
        }
      : { session: Session };
  }

  const namespace = await db.namespace.findUnique({
    where: {
      id: namespaceId,
      organization: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!namespace) {
    throw new AgentsetApiError({
      code: "not_found",
      message: "Namespace not found",
    });
  }

  // TODO: check role
  return { namespace, session } as AuthenticateSessionResult<T>;
};
