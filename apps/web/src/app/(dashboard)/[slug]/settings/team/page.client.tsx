"use client";

import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";
import { useOrganization } from "@/contexts/organization-context";
import { useSession } from "@/contexts/session-context";
import { PlusIcon } from "lucide-react";

import InviteMemberDialog from "./invite-dialog";
import { MemberCard } from "./member-card";
import { RemoveMemberButton } from "./remove-member";
import { RevokeInvitationButton } from "./revoke-invitation";

export default function TeamSettingsPage() {
  const [session] = useSession();
  const { activeOrganization, isAdmin } = useOrganization();

  const currentMember = activeOrganization.members.find(
    (member) => member.userId === session.user.id,
  );

  return (
    <>
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
            key={member.id}
            id={member.id}
            name={member.user.name}
            email={member.user.email}
            image={member.user.image}
            role={member.role}
            showRole={isAdmin}
            actions={
              isAdmin && member.role !== "owner" ? (
                <RemoveMemberButton
                  memberId={member.id}
                  currentMemberId={currentMember?.id}
                />
              ) : null
            }
          />
        ))}

        {activeOrganization.invitations
          .filter((invitation) => invitation.status === "pending")
          .map((invitation) => (
            <MemberCard
              key={invitation.id}
              id={invitation.id}
              name={invitation.email}
              email={invitation.status}
              role={invitation.role}
              showRole={isAdmin}
              actions={
                isAdmin ? (
                  <>
                    <RevokeInvitationButton invitationId={invitation.id} />

                    <div>
                      <CopyButton
                        textToCopy={`${typeof window !== "undefined" && window.location.origin}/invitation/${invitation.id}`}
                      />
                    </div>
                  </>
                ) : null
              }
            />
          ))}
      </div>
    </>
  );
}
