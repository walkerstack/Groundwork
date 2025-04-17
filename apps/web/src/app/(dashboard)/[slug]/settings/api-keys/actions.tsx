import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import type { ApiKeyDef } from "./columns";

export function ApiKeyActions({ row }: { row: Row<ApiKeyDef> }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const orgId = row.original.organizationId;
  const id = row.original.id;

  const { mutateAsync: deleteApiKey, isPending } = useMutation(
    trpc.apiKey.deleteApiKey.mutationOptions({
      onSuccess: () => {
        const queryFilter = trpc.apiKey.getApiKeys.queryFilter({ orgId });
        queryClient.setQueriesData(queryFilter, (old) => {
          if (!old) return [];
          return old.filter((key) => key.id !== id);
        });
        void queryClient.invalidateQueries(queryFilter);

        toast.success("API key deleted");
      },
    }),
  );

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
