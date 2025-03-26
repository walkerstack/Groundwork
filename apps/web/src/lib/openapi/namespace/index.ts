import type { ZodOpenApiPathsObject } from "zod-openapi";

import { createNamespace } from "./create-namespace";
import { deleteNamespace } from "./delete-namespace";
import { getNamespace } from "./get-namespace";
import { listNamespaces } from "./list-namespaces";
import { updateNamespace } from "./update-namespace";

export const namespacePaths: ZodOpenApiPathsObject = {
  "/namespace": {
    get: listNamespaces,
    post: createNamespace,
  },
  "/namespace/{namespaceId}": {
    get: getNamespace,
    patch: updateNamespace,
    delete: deleteNamespace,
  },
};
