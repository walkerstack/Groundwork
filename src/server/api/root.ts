import { namespaceRouter } from "@/server/api/routers/namespace";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { apiKeysRouter } from "./routers/api-keys";

export const appRouter = createTRPCRouter({
  namespace: namespaceRouter,
  apiKey: apiKeysRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
