import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { apiKeysRouter } from "./routers/api-keys";
import { ingestJobRouter } from "./routers/ingest-jobs";
import { namespaceRouter } from "./routers/namespaces";
import { documentsRouter } from "./routers/documents";

export const appRouter = createTRPCRouter({
  namespace: namespaceRouter,
  apiKey: apiKeysRouter,
  ingestJob: ingestJobRouter,
  document: documentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
