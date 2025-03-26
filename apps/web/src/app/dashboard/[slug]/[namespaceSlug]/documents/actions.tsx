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

import { DocumentStatus } from "@agentset/db";

import type { DocumentCol } from "./columns";

export function DocumentActions({ row }: { row: Row<DocumentCol> }) {
  const utils = api.useUtils();
  const { activeNamespace } = useNamespace();

  const { isPending, mutate: deleteDocument } = api.document.delete.useMutation(
    {
      onSuccess: () => {
        toast.success("Document deleted");
        void utils.document.all.invalidate();
      },
    },
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(row.original.id);
    toast.success("Copied ID");
  };

  const handleDelete = () => {
    void deleteDocument({
      documentId: row.original.id,
      namespaceId: activeNamespace.id,
    });
  };

  const isDeleteDisabled =
    isPending ||
    row.original.status === DocumentStatus.DELETING ||
    row.original.status === DocumentStatus.QUEUED_FOR_DELETE;

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
