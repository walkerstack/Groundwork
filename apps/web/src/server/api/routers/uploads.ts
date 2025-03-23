import { extname } from "node:path";
import { tryCatch } from "@/lib/error";
import { presignUploadUrl } from "@/lib/s3";
import { filenamize } from "@/lib/string-utils";
import { MAX_UPLOAD_SIZE } from "@/lib/upload";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getNamespaceByUser } from "../auth";

const supportedExtensions = [
  ".bmp",
  ".csv",
  ".doc",
  ".docx",
  ".eml",
  ".epub",
  ".heic",
  ".html",
  ".jpeg",
  ".png",
  ".md",
  ".msg",
  ".odt",
  ".org",
  ".p7s",
  ".pdf",
  ".png",
  ".ppt",
  ".pptx",
  ".rst",
  ".rtf",
  ".tiff",
  ".txt",
  ".tsv",
  ".xls",
  ".xlsx",
  ".xml",
];

export const uploadsRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        namespaceId: z.string(),
        fileName: z.string(),
        contentType: z.string(),
        fileSize: z.number().min(1).max(MAX_UPLOAD_SIZE),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ext = extname(input.fileName);
      const filename = filenamize(input.fileName.replace(ext, ""));

      if (!supportedExtensions.includes(ext)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unsupported file type",
        });
      }

      const ns = await getNamespaceByUser(ctx, { id: input.namespaceId });

      if (!ns) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Namespace not found",
        });
      }

      const key = `namespaces/${ns.id}/${filename}${ext}`;
      const url = await tryCatch(
        presignUploadUrl({
          key,
          contentType: input.contentType,
          fileSize: input.fileSize,
        }),
      );

      if (url.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return {
        url: url.data,
        key,
      };
    }),
});
