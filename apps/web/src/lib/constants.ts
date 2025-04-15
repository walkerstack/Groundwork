import { env } from "@/env";

export const HOME_DOMAIN =
  env.NODE_ENV === "development"
    ? `http://localhost:${process.env.PORT ?? 3000}`
    : "https://app.agentset.ai";

export const INFINITY_NUMBER = 1000000000;
