import { z } from "zod";

import { db, DocumentStatus } from "@agentset/db";

import {
  getPaginationArgs,
  paginateResults,
  paginationSchema,
} from "../pagination";

export const getAllDocumentsSchema = paginationSchema.extend({
  statuses: z.array(z.nativeEnum(DocumentStatus)).optional(),
  sortBy: z.enum(["createdAt", "totalCharacters"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const getAllDocuments = async (
  input: z.infer<typeof getAllDocumentsSchema> & {
    namespaceId: string;
    tenantId?: string;
  },
) => {
  const documents = await db.document.findMany({
    where: {
      tenantId: input.tenantId,
      ingestJob: {
        namespaceId: input.namespaceId,
      },
      ...(input.statuses &&
        input.statuses.length > 0 && { status: { in: input.statuses } }),
    },
    orderBy: [
      {
        [input.sortBy]: input.sortOrder,
      },
    ],
    ...getPaginationArgs(input),
  });

  return paginateResults(input, documents);
};
