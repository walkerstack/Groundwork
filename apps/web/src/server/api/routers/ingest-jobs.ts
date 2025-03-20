import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getAllIngestJobs,
  getAllIngestJobsSchema,
} from "@/services/ingest-jobs/all";
import { deleteIngestJob } from "@/services/ingest-jobs/delete";
import { ingestFile } from "@/services/ingest-jobs/file";
import { ingestText } from "@/services/ingest-jobs/text";
import { ingestUrls } from "@/services/ingest-jobs/urls";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getNamespaceByUser } from "../auth";

const configSchema = z.object({
  chunkSize: z.number().optional(),
  chunkOverlap: z.number().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const ingestJobRouter = createTRPCRouter({
  all: protectedProcedure
    .input(getAllIngestJobsSchema)
    .query(async ({ ctx, input }) => {
      const namespace = await getNamespaceByUser(ctx, {
        id: input.namespaceId,
      });

      if (!namespace) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return await getAllIngestJobs(input);
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

      return await ingestText({
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

      return await ingestFile({
        name: input.name,
        fileUrl: input.fileUrl,
        namespaceId: input.namespaceId,
        config: input.config,
      });
    }),
  ingestUrls: protectedProcedure
    .input(
      z.object({
        urls: z.array(z.string().url()),
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

      return await ingestUrls({
        urls: input.urls,
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
