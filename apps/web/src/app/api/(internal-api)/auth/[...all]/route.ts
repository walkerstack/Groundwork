import { makeAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler((req) => {
  const host = req.headers.get("host");
  // check if host is localhost
  const isLocalhost =
    host?.startsWith("localhost:") || host?.includes(".localhost:");
  const baseUrl = isLocalhost ? `http://${host}` : `https://${host}`;

  return makeAuth(baseUrl).handler(req);
});
