"use client";

import type { BadgeProps } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/string-utils";
import { formatMs } from "@/lib/utils";

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
      return (
        <pre>
          {row.original.config
            ? JSON.stringify(row.original.config, null, 2)
            : "-"}
        </pre>
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
      return (
        <p>
          {row.original.completedAt && row.original.queuedAt
            ? formatMs(
                row.original.completedAt.getTime() -
                  row.original.queuedAt.getTime(),
              )
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
