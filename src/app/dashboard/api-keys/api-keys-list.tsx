import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";

type ApiKey = RouterOutputs["apiKey"]["getApiKeys"][number];

export default function ApiKeysList({ orgId }: { orgId: string }) {
  const { data, isLoading } = api.apiKey.getApiKeys.useQuery({
    orgId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.length === 0) {
    return <div>No API keys found</div>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {data?.map((apiKey) => (
        <Item key={apiKey.id} apiKey={apiKey} orgId={orgId} />
      ))}
    </ul>
  );
}

const Item = ({ apiKey, orgId }: { apiKey: ApiKey; orgId: string }) => {
  const utils = api.useUtils();
  const { mutateAsync: deleteApiKey, isPending } =
    api.apiKey.deleteApiKey.useMutation({
      onSuccess: () => {
        utils.apiKey.getApiKeys.setData({ orgId }, (old) => {
          if (!old) return [];
          return old.filter((key) => key.id !== apiKey.id);
        });
        void utils.apiKey.getApiKeys.invalidate({ orgId });

        toast.success("API key deleted");
      },
    });

  const handleDelete = async () => {
    await deleteApiKey({ orgId, id: apiKey.id });
  };

  return (
    <li
      key={apiKey.id}
      className="flex items-center justify-between rounded-md border p-4"
    >
      <div className="flex items-center gap-10">
        <p className="text-lg font-semibold">{apiKey.label}</p>
        <p className="text-muted-foreground text-sm">Scope: {apiKey.scope}</p>
        <p className="text-muted-foreground text-sm">
          {apiKey.createdAt.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <Button
        variant="destructive"
        onClick={handleDelete}
        isLoading={isPending}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </li>
  );
};
