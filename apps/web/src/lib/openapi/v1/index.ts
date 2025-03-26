import type { ZodOpenApiPathsObject } from "zod-openapi";

import { chatPaths } from "./chat";
import { documentsPaths } from "./documents";
import { ingestJobsPaths } from "./ingest-job";
import { namespacePaths } from "./namespace";
import { searchPaths } from "./search";

export const v1Paths: ZodOpenApiPathsObject = {
  ...namespacePaths,
  ...ingestJobsPaths,
  ...documentsPaths,
  ...searchPaths,
  ...chatPaths,
};
