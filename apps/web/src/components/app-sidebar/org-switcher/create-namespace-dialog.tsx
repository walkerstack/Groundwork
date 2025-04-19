"use client";

import CreateNamespaceForm from "@/components/create-namespace";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTRPC } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateNamespaceDialog({
  organization,
  open,
  setOpen,
}: {
  organization?: { id: string; slug: string } | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const isPending = queryClient.isMutating(
    trpc.namespace.createNamespace.mutationOptions(),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (isPending) return;
        setOpen(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create namespace</DialogTitle>
          <DialogDescription>
            Create a new namespace to start ingesting data.
          </DialogDescription>
        </DialogHeader>

        <CreateNamespaceForm
          isDialog
          onSuccess={() => {
            setOpen(false);
          }}
          organization={organization}
        />
      </DialogContent>
    </Dialog>
  );
}
