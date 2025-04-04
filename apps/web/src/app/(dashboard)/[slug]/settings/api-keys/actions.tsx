import type { Row } from "@tanstack/react-table";
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

import type { ApiKeyDef } from "./columns";

export function ApiKeyActions({ row }: { row: Row<ApiKeyDef> }) {
  const utils = api.useUtils();
  const orgId = row.original.organizationId;
  const id = row.original.id;

  const { mutateAsync: deleteApiKey, isPending } =
    api.apiKey.deleteApiKey.useMutation({
      onSuccess: () => {
        utils.apiKey.getApiKeys.setData({ orgId }, (old) => {
          if (!old) return [];
          return old.filter((key) => key.id !== id);
        });
        void utils.apiKey.getApiKeys.invalidate({ orgId });

        toast.success("API key deleted");
      },
    });

  const handleDelete = async () => {
    await deleteApiKey({ orgId, id });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <EllipsisVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleDelete} disabled={isPending}>
          <Trash2Icon className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
