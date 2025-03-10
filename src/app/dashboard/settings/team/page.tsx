"use client";

import { useState } from "react";
import DashboardPageWrapper from "../../dashboard-page-wrapper";
import InviteMemberDialog from "./invite-dialog";
import { useDashboard } from "../../dashboard-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import CopyButton from "@/components/ui/copy-button";

export default function TeamSettingsPage() {
  const [isRevoking, setIsRevoking] = useState<string[]>([]);

  const inviteVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
  };

  const { session, activeOrganization, setActiveOrganization } = useDashboard();
  const currentMember = activeOrganization?.members.find(
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
              invitations: activeOrganization?.invitations.filter(
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

  return (
    <DashboardPageWrapper title="Team">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex flex-grow flex-col gap-2">
          <p className="border-b-foreground/10 border-b-2 font-medium">
            Members
          </p>
          <div className="flex flex-col gap-2">
            {activeOrganization?.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 sm:flex">
                    <AvatarImage
                      src={member.user.image || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {member.user.name?.charAt(0) ||
                        member.user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {member.role}
                    </p>
                  </div>
                </div>
                {member.role !== "owner" &&
                  (currentMember?.role === "owner" ||
                    currentMember?.role === "admin") && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        void authClient.organization.removeMember({
                          memberIdOrEmail: member.id,
                        });
                      }}
                    >
                      {currentMember?.id === member.id ? "Leave" : "Remove"}
                    </Button>
                  )}
              </div>
            ))}
            {!activeOrganization?.id && (
              <div>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={session?.user.image || undefined} />
                    <AvatarFallback>
                      {session?.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{session?.user.name}</p>
                    <p className="text-muted-foreground text-xs">Owner</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-2">
          <p className="border-b-foreground/10 border-b-2 font-medium">
            Invites
          </p>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {activeOrganization?.invitations
                .filter((invitation) => invitation.status === "pending")
                .map((invitation) => (
                  <motion.div
                    key={invitation.id}
                    className="flex items-center justify-between"
                    variants={inviteVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <div>
                      <p className="text-sm">{invitation.email}</p>
                      <p className="text-muted-foreground text-xs">
                        {invitation.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        disabled={isRevoking.includes(invitation.id)}
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevoke(invitation.id)}
                      >
                        {isRevoking.includes(invitation.id) ? (
                          <Loader2Icon className="animate-spin" size={16} />
                        ) : (
                          "Revoke"
                        )}
                      </Button>
                      <div>
                        <CopyButton
                          textToCopy={`${window.location.origin}/accept-invitation/${invitation.id}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {activeOrganization?.invitations.length === 0 && (
              <motion.p
                className="text-muted-foreground text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No Active Invitations
              </motion.p>
            )}

            {!activeOrganization?.id ? (
              <Label className="text-muted-foreground text-xs">
                You can&apos;t invite members to your personal workspace.
              </Label>
            ) : (
              <InviteMemberDialog />
            )}
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
