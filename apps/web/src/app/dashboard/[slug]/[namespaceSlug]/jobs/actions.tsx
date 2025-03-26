import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNamespace } from "@/contexts/namespace-context";
import { api } from "@/trpc/react";
import { CopyIcon, EllipsisVerticalIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { IngestJobStatus } from "@agentset/db";

import type { JobCol } from "./columns";

export function JobActions({ row }: { row: Row<JobCol> }) {
  const utils = api.useUtils();
  const { activeNamespace } = useNamespace();
  const { mutate: deleteJob, isPending } = api.ingestJob.delete.useMutation({
    onSuccess: () => {
      toast.success("Ingest job deleted");
      void utils.ingestJob.all.invalidate();
    },
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(row.original.id);
    toast.success("Copied ID");
  };

  const handleDelete = () => {
    deleteJob({
      namespaceId: activeNamespace.id,
      jobId: row.original.id,
    });
  };

  const isDeleteDisabled =
    isPending ||
    row.original.status === IngestJobStatus.DELETING ||
    row.original.status === IngestJobStatus.QUEUED_FOR_DELETE;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleCopy}>
          <CopyIcon className="size-4" />
          Copy ID
        </DropdownMenuItem>

        <DropdownMenuItem disabled={isDeleteDisabled} onClick={handleDelete}>
          <Trash2Icon className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
