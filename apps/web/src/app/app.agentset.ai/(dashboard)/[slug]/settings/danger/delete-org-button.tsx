"use client";

import { Button } from "@/components/ui/button";
import { useOrganization } from "@/contexts/organization-context";
import { useTRPC } from "@/trpc/react";
import { useRouter } from "@bprogress/next/app";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function DeleteOrgButton() {
  const { activeOrganization, isAdmin } = useOrganization();
  const router = useRouter();
  const trpc = useTRPC();
  const { mutate: deleteOrganization, isPending } = useMutation(
    trpc.organization.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Organization deleted");
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete organization");
      },
    }),
  );

  if (!isAdmin) return null;

  return (
    <Button
      variant="destructive"
      isLoading={isPending}
      onClick={() =>
        deleteOrganization({ organizationId: activeOrganization.id })
      }
    >
      Delete
    </Button>
  );
}
