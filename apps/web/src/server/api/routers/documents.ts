import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getAllDocuments,
  getAllDocumentsSchema,
} from "@/services/documents/all";
import {
  deleteDocument,
  deleteDocumentSchema,
} from "@/services/documents/delete";
import { TRPCError } from "@trpc/server";

import { getNamespaceByUser } from "../auth";

export const documentsRouter = createTRPCRouter({
  all: protectedProcedure
    .input(getAllDocumentsSchema)
    .query(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return await getAllDocuments(input);
    }),
  delete: protectedProcedure
    .input(deleteDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.document.findUnique({
        where: {
          id: input.documentId,
          ingestJob: {
            namespace: {
              organization: {
                members: {
                  some: {
                    userId: ctx.session.user.id,
                    role: { in: ["admin", "owner"] },
                  },
                },
              },
            },
          },
        },
        select: { id: true },
      });

      if (!document) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updatedDocument = await deleteDocument({
        documentId: input.documentId,
      });

      return updatedDocument;
    }),
});
