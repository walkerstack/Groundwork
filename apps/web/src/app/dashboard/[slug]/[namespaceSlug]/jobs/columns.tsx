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
import { capitalize } from "@/lib/string-utils";
import { formatMs } from "@/lib/utils";
import { api } from "@/trpc/react";
import { CopyIcon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react";
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

export const columns: ColumnDef<Job>[] = [
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

      const copyId = async () => {
        await navigator.clipboard.writeText(row.original.id);
        toast.success("Copied ID");
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onClick={copyId}>
              <CopyIcon className="size-4" />
              Copy ID
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={
                isPending ||
                row.original.status === IngestJobStatus.DELETING ||
                row.original.status === IngestJobStatus.QUEUED_FOR_DELETE
              }
              onClick={() => deleteJob({ jobId: row.original.id })}
            >
              <Trash2Icon className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
