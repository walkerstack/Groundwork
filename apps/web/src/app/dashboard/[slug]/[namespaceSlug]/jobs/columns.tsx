"use client";

import type { BadgeProps } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import type { IngestJob } from "@agentset/db";
import { IngestJobStatus } from "@agentset/db";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface Job {
  id: string;
  status: IngestJobStatus;
  payload: IngestJob["payload"];
  config: IngestJob["config"];
  tenantId?: IngestJob["tenantId"];
  completedAt?: IngestJob["completedAt"];
  createdAt?: IngestJob["createdAt"];
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

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "payload",
    header: "Source",
    cell: ({ row }) => {
      return (
        <p className="capitalize">{row.original.payload.type.toLowerCase()}</p>
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
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return (
        <p>
          {row.original.createdAt ? formatDate(row.original.createdAt) : "-"}
        </p>
      );
    },
  },
  {
    accessorKey: "completedAt",
    header: "Completed At",
    cell: ({ row }) => {
      return (
        <p>
          {row.original.completedAt
            ? formatDate(row.original.completedAt)
            : "-"}
        </p>
      );
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
    id: "actions",
    cell: ({ row }) => {
      const utils = api.useUtils();
      const { mutate: deleteJob, isPending } = api.ingestJob.delete.useMutation(
        {
          onSuccess: () => {
            toast.success("Ingest job deleted");
            void utils.ingestJob.all.invalidate();
          },
        },
      );

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem
              disabled={
                isPending ||
                row.original.status === IngestJobStatus.DELETING ||
                row.original.status === IngestJobStatus.QUEUED_FOR_DELETE
              }
              onClick={() => deleteJob({ jobId: row.original.id })}
            >
              <Trash2Icon className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
