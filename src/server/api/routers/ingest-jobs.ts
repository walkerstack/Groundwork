import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getNamespaceByUser } from "../auth";
import { ingestText } from "@/server/services/ingest/text";
import { ingestFile } from "@/server/services/ingest/file";
import { deleteIngestJob } from "@/server/services/ingest/delete";
import { IngestJobStatus } from "@prisma/client";

const configSchema = z.object({
  chunkSize: z.number().optional(),
  chunkOverlap: z.number().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const ingestJobRouter = createTRPCRouter({
  all: protectedProcedure
    .input(
      z.object({
        namespaceId: z.string(),
        statuses: z.array(z.nativeEnum(IngestJobStatus)).optional(),
        orderBy: z.enum(["createdAt"]).optional().default("createdAt"),
        order: z.enum(["asc", "desc"]).optional().default("desc"),
        cursor: z.string().optional(),
        perPage: z.number().optional().default(30),
        cursorDirection: z
          .enum(["forward", "backward"])
          .optional()
          .default("forward"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const ingestJobs = await ctx.db.ingestJob.findMany({
        where: {
          namespaceId: namespace.id,
          ...(input.statuses &&
            input.statuses.length > 0 && {
              status: { in: input.statuses },
            }),
        },
        orderBy: [
          {
            [input.orderBy]: input.order,
          },
        ],
        take:
          (input.perPage + 1) * (input.cursorDirection === "forward" ? 1 : -1),
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      return {
        records: ingestJobs.slice(0, input.perPage),
        nextCursor:
          ingestJobs.length > input.perPage
            ? ingestJobs[ingestJobs.length - 1]?.id
            : null,
      };
    }),
  ingestText: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        text: z.string(),
        namespaceId: z.string(),
        config: configSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ingestText({
        name: input.name,
        text: input.text,
        namespaceId: input.namespaceId,
        config: input.config,
      });
    }),
  ingestFile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        fileUrl: z.string(),
        namespaceId: z.string(),
        config: configSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ingestFile({
        name: input.name,
        fileUrl: input.fileUrl,
        namespaceId: input.namespaceId,
        config: input.config,
      });
    }),
  delete: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ingestJob = await deleteIngestJob({
        jobId: input.jobId,
        userId: ctx.session.user.id,
      });

      if (!ingestJob) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ingestJob;
    }),
});
