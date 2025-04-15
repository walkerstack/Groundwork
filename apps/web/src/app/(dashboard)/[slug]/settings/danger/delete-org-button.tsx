"use client";

import { Button } from "@/components/ui/button";
import { useOrganization } from "@/contexts/organization-context";
import { api } from "@/trpc/react";
import { useRouter } from "@bprogress/next/app";
import { toast } from "sonner";

export function DeleteOrgButton() {
  const { activeOrganization, isAdmin } = useOrganization();
  const router = useRouter();
  const { mutate: deleteOrg, isPending } =
    api.organization.deleteOrganization.useMutation({
      onSuccess: () => {
        toast.success("Organization deleted");
        router.push("/");
      },
      onError: (error) => {
        toast.error("Failed to delete organization");
      },
    });

  if (!isAdmin) return null;

  return (
    <Button
      variant="destructive"
      isLoading={isPending}
      onClick={() => deleteOrg({ organizationId: activeOrganization.id })}
    >
      Delete
    </Button>
  );
}
