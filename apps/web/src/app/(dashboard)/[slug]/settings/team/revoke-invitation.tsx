import { Button } from "@/components/ui/button";
import { useOrganization } from "@/contexts/organization-context";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const RevokeInvitationButton = ({
  invitationId,
}: {
  invitationId: string;
}) => {
  const { activeOrganization, setActiveOrganization } = useOrganization();
  const { mutateAsync: revokeInvitation, isPending: isRevoking } = useMutation({
    mutationFn: async () => {
      const data = await authClient.organization.cancelInvitation({
        invitationId,
      });

      if (data.error || !data.data) {
        throw new Error(data.error?.message || "Failed to revoke invitation");
      }

      return data.data;
    },
    onSuccess: (data) => {
      toast.success("Invitation revoked successfully");
      setActiveOrganization({
        ...activeOrganization,
        invitations: activeOrganization.invitations.filter(
          (inv) => inv.id !== data.id,
        ),
      });
    },
  });

  return (
    <Button
      size="sm"
      variant="destructive"
      isLoading={isRevoking}
      onClick={() => revokeInvitation()}
    >
      Revoke
    </Button>
  );
};
