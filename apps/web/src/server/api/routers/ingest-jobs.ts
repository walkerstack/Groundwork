import {
  createIngestJobSchema,
  getIngestionJobsSchema,
} from "@/schemas/api/ingest-job";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createIngestJob } from "@/services/ingest-jobs/create";
import { deleteIngestJob } from "@/services/ingest-jobs/delete";
import { getPaginationArgs, paginateResults } from "@/services/pagination";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { IngestJobStatus } from "@agentset/db";

import { getNamespaceByUser } from "../auth";

export const ingestJobRouter = createTRPCRouter({
  all: protectedProcedure
    .input(getIngestionJobsSchema.extend({ namespaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const ingestJobs = await ctx.db.ingestJob.findMany({
        where: {
          namespaceId: input.namespaceId,
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
        ...getPaginationArgs(input),
      });

      return paginateResults(input, ingestJobs);
    }),
  ingest: protectedProcedure
    .input(
      createIngestJobSchema.extend({
        namespaceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return await createIngestJob({
        payload: input.payload,
        namespaceId: input.namespaceId,
        organizationId: namespace.organizationId,
        config: input.config,
      });
    }),
  delete: protectedProcedure
    .input(z.object({ jobId: z.string(), namespaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const ingestJob = await ctx.db.ingestJob.findUnique({
        where: {
          id: input.jobId,
          namespaceId: namespace.id,
        },
        select: { id: true, status: true },
      });

      if (!ingestJob) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (
        ingestJob.status === IngestJobStatus.QUEUED_FOR_DELETE ||
        ingestJob.status === IngestJobStatus.DELETING
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const updatedIngestJob = await deleteIngestJob(ingestJob.id);

      return updatedIngestJob;
    }),
});
