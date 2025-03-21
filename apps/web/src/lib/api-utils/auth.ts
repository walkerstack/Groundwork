import type { NextRequest } from "next/server";

import type { Session } from "../auth-types";
import { getApiKeyScopeAndOrganizationId } from ".";
import { tryCatch } from "../error";
import { supabase } from "../supabase";
import { makeApiErrorResponse } from "./response";

const makeErrorResponse = () =>
  makeApiErrorResponse({
    message: "Invalid API key",
    status: 401,
  });

// via api key
export const authenticateRequest = async (
  request: NextRequest,
  namespaceId?: string,
) => {
  const _apiKey = request.headers.get("Authorization");
  const apiKey = _apiKey?.replace("Bearer ", "");

  if (!apiKey) {
    return {
      error: makeErrorResponse(),
      data: null,
    };
  }

  const orgApiKey = await tryCatch(getApiKeyScopeAndOrganizationId(apiKey));

  if (!orgApiKey.data) {
    return {
      error: makeErrorResponse(),
      data: null,
    };
  }

  if (namespaceId) {
    const { data: namespace } = await supabase
      .from("namespace")
      .select("organizationId")
      .eq("id", namespaceId)
      .single();

    if (
      !namespace ||
      namespace.organizationId !== orgApiKey.data.organizationId
    ) {
      return {
        error: makeApiErrorResponse({
          message: "Namespace not found",
          status: 404,
        }),
        data: null,
      };
    }
  }

  return {
    error: null,
    data: orgApiKey.data,
  };
};

export const authenticateRequestWithSession = async (
  request: NextRequest,
  namespaceId: string,
) => {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    /* empty */
  }

  if (!session) {
    return {
      error: makeApiErrorResponse({
        message: "Unauthenticated",
        status: 401,
      }),
      data: null,
    };
  }

  const { data: namespace } = await supabase
    .from("namespace")
    .select("organizationId")
    .eq("id", namespaceId)
    .single();

  if (!namespace) {
    return {
      error: makeApiErrorResponse({
        message: "Namespace not found",
        status: 404,
      }),
      data: null,
    };
  }

  const { data: member } = await supabase
    .from("member")
    .select("id, role")
    .eq("organizationId", namespace.organizationId)
    .eq("userId", session.user.id)
    .single();

  if (!member?.id) {
    return {
      error: makeApiErrorResponse({
        message: "Unauthenticated",
        status: 401,
      }),
      data: null,
    };
  }

  // TODO: check role
  return {
    error: null,
    data: {
      organizationId: namespace.organizationId,
    },
  };
};
