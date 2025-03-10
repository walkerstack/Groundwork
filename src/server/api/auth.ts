import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getServerAuthSession = cache(async (headersObj?: Headers) =>
  auth.api.getSession({
    headers: headersObj ?? (await headers()),
  }),
);
