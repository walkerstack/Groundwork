import type { ZodOpenApiPathsObject } from "zod-openapi";

import { deleteDocument } from "./delete-document";
import { getDocument } from "./get-document";
import { listDocuments } from "./list-documents";

export const documentsPaths: ZodOpenApiPathsObject = {
  "/namespace/{namespaceId}/documents": {
    get: listDocuments,
  },
  "/namespace/{namespaceId}/documents/{documentId}": {
    get: getDocument,
    delete: deleteDocument,
  },
};
