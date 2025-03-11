"use client";

import { useState } from "react";
import DashboardPageWrapper from "../../dashboard-page-wrapper";
import InviteMemberDialog from "./invite-dialog";
import { useOrganization } from "@/contexts/organization-context";
import { useSession } from "@/contexts/session-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

import { toast } from "sonner";
import { ChevronDownIcon, Loader2Icon, PlusIcon } from "lucide-react";
import CopyButton from "@/components/ui/copy-button";

import { Separator } from "@/components/ui/separator";
import RoleSelector from "./role-selector";
import { Role } from "@/lib/auth-types";

const MemberCard = ({
  name,
  email,
  image,
  role,
  showRole,
  actions,
}: {
  name?: string;
  email: string;
  image?: string;
  role?: string;
  showRole?: boolean;
  actions?: React.ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={image || undefined} className="object-cover" />
          <AvatarFallback>{name?.charAt(0) || email.charAt(0)}</AvatarFallback>
        </Avatar>

        <div>
          {name ? (
            <>
              <p className="text-sm leading-none font-medium">{name}</p>
              <p className="text-muted-foreground text-sm">{email}</p>
            </>
          ) : (
            <p className="text-sm leading-none font-medium">{email}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {role && (
          <RoleSelector
            disabled={!showRole}
            role={role as Role}
            setRole={() => {}}
          />
        )}
        {actions}
      </div>
    </div>
  );
};

export default function TeamSettingsPage() {
  const [isRevoking, setIsRevoking] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState<string[]>([]);

  const [session] = useSession();
  const { activeOrganization, setActiveOrganization, isAdmin } =
    useOrganization();

  const currentMember = activeOrganization.members.find(
    (member) => member.userId === session.user.id,
  );

  const handleRevoke = async (invitationId: string) => {
    await authClient.organization.cancelInvitation(
      {
        invitationId,
      },
      {
        onRequest: () => {
          setIsRevoking([...isRevoking, invitationId]);
        },
        onSuccess: () => {
          toast.message("Invitation revoked successfully");
          setIsRevoking(isRevoking.filter((id) => id !== invitationId));
          if (activeOrganization) {
            setActiveOrganization({
              ...activeOrganization,
              invitations: activeOrganization.invitations.filter(
                (inv) => inv.id !== invitationId,
              ),
            });
          }
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsRevoking(isRevoking.filter((id) => id !== invitationId));
        },
      },
    );
  };

  const handleRemoveMember = async (memberId: string) => {
    await authClient.organization.removeMember({
      memberIdOrEmail: memberId,
      fetchOptions: {
        onRequest: () => {
          setIsRemoving([...isRemoving, memberId]);
        },
        onSuccess: () => {
          toast.message("Member removed successfully");
          setIsRemoving(isRemoving.filter((id) => id !== memberId));
          if (activeOrganization) {
            setActiveOrganization({
              ...activeOrganization,
              members: activeOrganization.members.filter(
                (m) => m.id !== memberId,
              ),
            });
          }
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsRemoving(isRemoving.filter((id) => id !== memberId));
        },
      },
    });
  };

  return (
    <DashboardPageWrapper title="Team">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Team Members</h2>
          <p className="text-muted-foreground text-sm">
            Invite your team members to collaborate.
          </p>
        </div>

        {isAdmin && (
          <InviteMemberDialog
            trigger={
              <Button>
                <PlusIcon className="size-4" />
                Invite Member
              </Button>
            }
          />
        )}
      </div>

      <Separator className="my-4" />

      <div className="grid gap-6">
        {activeOrganization.members.map((member) => (
          <MemberCard
            name={member.user.name}
            email={member.user.email}
            image={member.user.image}
            role={member.role}
            showRole={isAdmin}
            actions={
              isAdmin && member.role !== "owner" ? (
                <Button
                  size="sm"
                  variant="destructive"
                  isLoading={isRemoving.includes(member.id)}
                  onClick={() => handleRemoveMember(member.id)}
                >
                  {currentMember?.id === member.id ? "Leave" : "Remove"}
                </Button>
              ) : null
            }
          />
        ))}

        {activeOrganization?.invitations
          .filter((invitation) => invitation.status === "pending")
          .map((invitation) => (
            <MemberCard
              key={invitation.id}
              name={invitation.email}
              email={invitation.status}
              role={invitation.role}
              showRole={isAdmin}
              actions={
                isAdmin ? (
                  <>
                    <Button
                      disabled={isRevoking.includes(invitation.id)}
                      size="sm"
                      variant="destructive"
                      isLoading={isRevoking.includes(invitation.id)}
                      onClick={() => handleRevoke(invitation.id)}
                    >
                      Revoke
                    </Button>
                    <div>
                      <CopyButton
                        textToCopy={`${window.location.origin}/accept-invitation/${invitation.id}`}
                      />
                    </div>
                  </>
                ) : null
              }
            />
          ))}
      </div>
    </DashboardPageWrapper>
  );
}
