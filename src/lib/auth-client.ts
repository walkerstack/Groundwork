import { createAuthClient } from "better-auth/react";
import {
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import { getBaseUrl } from "./utils";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [organizationClient(), magicLinkClient()],
});
