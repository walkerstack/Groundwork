"use client";

import type { BadgeProps } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { capitalize } from "@/lib/string-utils";
import { formatBytes, formatMs, formatNumber } from "@/lib/utils";
import { BookTextIcon, Code2Icon, FileTextIcon, ImageIcon } from "lucide-react";

import type { Document } from "@agentset/db";
import { DocumentStatus } from "@agentset/db";

import { DocumentActions } from "./actions";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface DocumentCol {
  id: string;
  status: DocumentStatus;
  name?: string | null;
  source: Document["source"];
  totalChunks: number;
  totalCharacters: number;
  totalTokens: number;
  documentProperties?: Document["documentProperties"];
  completedAt?: Date | null;
  createdAt: Date;
}

const MimeType = ({ mimeType }: { mimeType: string }) => {
  let Icon;
  if (mimeType === "application/pdf") {
    Icon = BookTextIcon;
  } else if (mimeType.startsWith("image/")) {
    Icon = ImageIcon;
  } else if (
    mimeType === "text/html" ||
    mimeType === "application/xhtml+xml" ||
    mimeType === "text/xml"
  ) {
    Icon = Code2Icon;
  } else {
    Icon = FileTextIcon;
  }

  return (
    <div className="flex flex-row gap-2">
      <Tooltip>
        <TooltipTrigger>
          <Icon className="size-5" />
        </TooltipTrigger>
        <TooltipContent>{mimeType}</TooltipContent>
      </Tooltip>
    </div>
  );
};

const statusToBadgeVariant = (
  status: DocumentStatus,
): BadgeProps["variant"] => {
  switch (status) {
    case DocumentStatus.FAILED:
    case DocumentStatus.CANCELLED:
    case DocumentStatus.QUEUED_FOR_DELETE:
    case DocumentStatus.DELETING:
      return "destructive";

    case DocumentStatus.COMPLETED:
      return "success";

    case DocumentStatus.PRE_PROCESSING:
      return "secondary";

    case DocumentStatus.PROCESSING:
      return "default";

    default:
      return "outline";
  }
};

export const columns: ColumnDef<DocumentCol>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <p>{row.original.name ?? "-"}</p>;
    },
  },
  {
    id: "source",
    header: "Source",
    accessorKey: "source",
    cell: ({ row }) => {
      return <p>{capitalize(row.original.source.type.split("_").join(" "))}</p>;
    },
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "documentProperties.mimeType",
    cell: ({ row }) => {
      return (
        <div>
          {row.original.documentProperties?.mimeType ? (
            <MimeType mimeType={row.original.documentProperties.mimeType} />
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "totalChunks",
    header: "Total Chunks",
    cell: ({ row }) => {
      return <p>{formatNumber(row.original.totalChunks, "compact")}</p>;
    },
  },
  {
    accessorKey: "totalCharacters",
    header: "Total Characters",
    cell: ({ row }) => {
      return <p>{formatNumber(row.original.totalCharacters, "compact")}</p>;
    },
  },
  {
    accessorKey: "totalTokens",
    header: "Total Tokens",
    cell: ({ row }) => {
      return <p>{formatNumber(row.original.totalTokens, "compact")}</p>;
    },
  },
  {
    id: "size",
    accessorKey: "documentProperties.fileSize",
    header: "Size",
    cell: ({ row }) => {
      return (
        <p>
          {row.original.documentProperties?.fileSize
            ? formatBytes(row.original.documentProperties.fileSize)
            : "-"}
        </p>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge
          variant={statusToBadgeVariant(row.original.status)}
          className="capitalize"
        >
          {row.original.status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) => {
      return (
        <p>
          {row.original.completedAt
            ? formatMs(
                row.original.completedAt.getTime() -
                  row.original.createdAt.getTime(),
              )
            : "-"}
        </p>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DocumentActions row={row} />,
  },
];
