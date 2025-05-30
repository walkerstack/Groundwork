"use client";

import type { BadgeProps } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { capitalize } from "@/lib/string-utils";
import { formatMs } from "@/lib/utils";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import type { IngestJob } from "@agentset/db";
import { IngestJobStatus } from "@agentset/db";

import { JobActions } from "./actions";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface JobCol {
  id: string;
  status: IngestJobStatus;
  payload: IngestJob["payload"];
  config: IngestJob["config"];
  tenantId?: IngestJob["tenantId"];
  completedAt?: IngestJob["completedAt"];
  failedAt?: IngestJob["failedAt"];
  error?: IngestJob["error"];
  queuedAt?: IngestJob["queuedAt"];
  createdAt: IngestJob["createdAt"];
}

const statusToBadgeVariant = (
  status: IngestJobStatus,
): BadgeProps["variant"] => {
  switch (status) {
    case IngestJobStatus.FAILED:
    case IngestJobStatus.CANCELLED:
    case IngestJobStatus.QUEUED_FOR_DELETE:
    case IngestJobStatus.DELETING:
      return "destructive";
    case IngestJobStatus.COMPLETED:
      return "success";
    case IngestJobStatus.PRE_PROCESSING:
      return "secondary";
    case IngestJobStatus.PROCESSING:
      return "default";
    default:
      return "outline";
  }
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString();
};

export const columns: ColumnDef<JobCol>[] = [
  {
    id: "expand",
    header: "",
    cell: ({ row, table }) => {
      const meta = table.options.meta as JobsTableMeta | undefined;
      const expandedJobId = meta?.expandedJobId;
      const onExpand = meta?.onExpand;
      const isExpanded = expandedJobId === row.original.id;
      return (
        <Button
          variant="ghost"
          size="icon"
          aria-label={isExpanded ? "Collapse" : "Expand"}
          onClick={() => onExpand?.(isExpanded ? null : row.original.id)}
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </Button>
      );
    },
    size: 32,
  },
  {
    id: "name",
    accessorKey: "payload",
    header: "Name",
    cell: ({ row }) => {
      const name =
        "name" in row.original.payload ? row.original.payload.name : "-";
      return <p>{name}</p>;
    },
  },
  {
    id: "type",
    accessorKey: "payload",
    header: "Type",
    cell: ({ row }) => {
      return (
        <p>{capitalize(row.original.payload.type.split("_").join(" "))}</p>
      );
    },
  },
  {
    accessorKey: "config",
    header: "Config",
    cell: ({ row }) => {
      const config = row.original.config;
      if (!config) return <p>-</p>;

      const configStr = JSON.stringify(config, null, 2);
      const truncatedConfig =
        configStr.length > 50 ? configStr.slice(0, 50) + "..." : configStr;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
              <pre className="text-left">{truncatedConfig}</pre>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Job Config</DialogTitle>
            </DialogHeader>
            <pre className="bg-muted max-h-[60vh] overflow-auto rounded-md p-4">
              {configStr}
            </pre>
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    accessorKey: "tenantId",
    header: "Tenant ID",
    cell: ({ row }) => {
      return <p>{row.original.tenantId ?? "-"}</p>;
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const badge = (
        <Badge
          variant={statusToBadgeVariant(row.original.status)}
          className="capitalize"
        >
          {row.original.status.toLowerCase()}
        </Badge>
      );

      if (!row.original.error) return badge;

      return (
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>{row.original.error}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return <p>{formatDate(row.original.createdAt)}</p>;
    },
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const finishDate = row.original.completedAt ?? row.original.failedAt;
      return (
        <p>
          {finishDate && row.original.queuedAt
            ? formatMs(finishDate.getTime() - row.original.queuedAt.getTime())
            : "-"}
        </p>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <JobActions row={row} />,
  },
];

// Add a type for TableMeta to allow expandedJobId and onExpand
export type JobsTableMeta = {
  expandedJobId?: string | null;
  onExpand?: (jobId: string | null) => void;
};
