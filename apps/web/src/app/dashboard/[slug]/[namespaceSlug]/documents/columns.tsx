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

import type { Document } from "@agentset/db";
import { DocumentStatus } from "@agentset/db";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
interface DocumentCol {
  id: string;
  status: DocumentStatus;
  name?: string | null;
  totalChunks: number;
  totalCharacters: number;
  documentProperties?: Document["documentProperties"];
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
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
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "totalChunks",
    header: "Total Chunks",
  },
  {
    accessorKey: "totalCharacters",
    header: "Total Characters",
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "documentProperties.mimeType",
    cell: ({ row }) => {
      return <p>{row.original.documentProperties?.mimeType ?? "-"}</p>;
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
    id: "actions",
    cell: ({ row }) => {
      const utils = api.useUtils();
      const { isPending, mutate: deleteDocument } =
        api.document.delete.useMutation({
          onSuccess: () => {
            toast.success("Document deleted");
            void utils.document.all.invalidate();
          },
        });

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
                row.original.status === DocumentStatus.DELETING ||
                row.original.status === DocumentStatus.QUEUED_FOR_DELETE
              }
              onClick={() => deleteDocument({ documentId: row.original.id })}
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
