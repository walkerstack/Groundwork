import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateApiKey({ orgId }: { orgId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [scope, setScope] = useState<"all">("all");

  const utils = api.useUtils();
  const { isPending, mutateAsync, data } = api.apiKey.createApiKey.useMutation({
    onSuccess: (newKey) => {
      utils.apiKey.getApiKeys.setData({ orgId }, (old) => {
        if (!old) return [];
        return [...old, newKey];
      });
      void utils.apiKey.getApiKeys.invalidate({ orgId });

      toast.success("API key created");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await mutateAsync({
      orgId,
      label,
      scope,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        if (isPending) return;
        setIsOpen(newOpen);
      }}
    >
      <div>
        <DialogTrigger asChild>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> New API key
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-[425px]">
        {data ? (
          <div>
            <DialogHeader>
              <DialogTitle>Here is your API Key</DialogTitle>
            </DialogHeader>

            <pre className="bg-muted relative mt-5 flex-1 rounded-md p-4">
              {data.key}
              <CopyButton
                className="absolute top-1 right-1"
                textToCopy={data.key}
              />
            </pre>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>
                Create a new API key to start ingesting data.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label" className="text-right">
                  Label
                </Label>
                <Input
                  id="label"
                  placeholder="Next.js app"
                  className="col-span-3"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scope" className="text-right">
                  Scope
                </Label>

                <Select
                  value={scope}
                  onValueChange={(value) => setScope(value as "all")}
                >
                  <SelectTrigger id="scope" className="col-span-3">
                    <SelectValue placeholder="Select a scope" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" isLoading={isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
