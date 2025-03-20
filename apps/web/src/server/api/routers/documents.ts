import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { deleteDocument } from "@/server/services/documents/delete";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { DocumentStatus } from "@agentset/db";

import { getNamespaceByUser } from "../auth";

export const documentsRouter = createTRPCRouter({
  all: protectedProcedure
    .input(
      z.object({
        namespaceId: z.string(),
        statuses: z.array(z.nativeEnum(DocumentStatus)).optional(),
        sortBy: z.enum(["createdAt", "totalCharacters"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        cursor: z.string().optional(),
        cursorDirection: z.enum(["forward", "backward"]).default("forward"),
        perPage: z.number().optional().default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const documents = await ctx.db.document.findMany({
        where: {
          ingestJob: {
            namespaceId: namespace.id,
          },
          ...(input.statuses &&
            input.statuses.length > 0 && { status: { in: input.statuses } }),
        },
        orderBy: [
          {
            [input.sortBy]: input.sortOrder,
          },
        ],
        take:
          (input.perPage + 1) * (input.cursorDirection === "forward" ? 1 : -1),
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      return {
        records: documents.slice(0, input.perPage),
        nextCursor:
          documents.length > input.perPage
            ? documents[documents.length - 1]?.id
            : null,
      };
    }),
  delete: protectedProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const document = await deleteDocument({
        documentId: input.documentId,
        userId: ctx.session.user.id,
      });

      if (!document) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return document;
    }),
});
