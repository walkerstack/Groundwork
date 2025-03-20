"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useOrganization } from "@/contexts/organization-context";
import { api } from "@/trpc/react";
import { useRouter } from "@bprogress/next/app";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

export default function CreateNamespace() {
  const { activeOrganization } = useOrganization();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const { isPending, mutateAsync } = api.namespace.createNamespace.useMutation({
    onSuccess: (data) => {
      toast.success("Namespace created");
      setIsOpen(false);
      router.push(`/dashboard/${activeOrganization.slug}/${data.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await mutateAsync({
      orgId: activeOrganization.id,
      name,
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
            <PlusIcon className="mr-2 h-4 w-4" /> New namespace
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create namespace</DialogTitle>
            <DialogDescription>
              Create a new namespace to start ingesting data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Example"
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" isLoading={isPending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
