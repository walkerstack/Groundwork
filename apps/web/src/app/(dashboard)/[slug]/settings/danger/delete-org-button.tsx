"use client";

import { Button } from "@/components/ui/button";
import { useOrganization } from "@/contexts/organization-context";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@bprogress/next/app";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function DeleteOrgButton() {
  const { activeOrganization, isAdmin } = useOrganization();
  const router = useRouter();
  const { mutate: deleteOrg, isPending } = useMutation({
    mutationFn: async () =>
      authClient.organization.delete({
        organizationId: activeOrganization.id,
        fetchOptions: { throw: true },
      }),
    onSuccess: () => {
      toast.success("Organization deleted");
      router.push("/");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete organization");
    },
  });

  if (!isAdmin) return null;

  return (
    <Button
      variant="destructive"
      isLoading={isPending}
      onClick={() => deleteOrg()}
    >
      Delete
    </Button>
  );
}
