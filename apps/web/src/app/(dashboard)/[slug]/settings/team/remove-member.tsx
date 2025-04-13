import { Button } from "@/components/ui/button";
import { useOrganization } from "@/contexts/organization-context";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@bprogress/next/app";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const RemoveMemberButton = ({
  memberId,
  currentMemberId,
}: {
  memberId: string;
  currentMemberId?: string;
}) => {
  const { activeOrganization, setActiveOrganization } = useOrganization();
  const router = useRouter();
  const isCurrentMember = currentMemberId === memberId;

  const { mutateAsync: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: async () => {
      const data = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: activeOrganization.id,
      });

      if (data.error) {
        throw new Error(data.error.message || "Failed to remove member");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Member removed successfully");
      setActiveOrganization({
        ...activeOrganization,
        members: activeOrganization.members.filter((m) => m.id !== memberId),
      });

      if (isCurrentMember) {
        router.push("/");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Button
      size="sm"
      variant="destructive"
      isLoading={isRemoving}
      onClick={() => removeMember()}
    >
      {isCurrentMember ? "Leave" : "Remove"}
    </Button>
  );
};
