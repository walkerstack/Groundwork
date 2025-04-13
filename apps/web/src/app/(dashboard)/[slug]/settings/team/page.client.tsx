"use client";

import { useMemo } from "react";
import CopyButton from "@/components/ui/copy-button";
import { useOrganization } from "@/contexts/organization-context";
import { authClient } from "@/lib/auth-client";

import { MemberCard } from "./member-card";
import { RemoveMemberButton } from "./remove-member";
import { RevokeInvitationButton } from "./revoke-invitation";

export default function TeamSettingsPage() {
  const { data: session } = authClient.useSession();
  const { activeOrganization, isAdmin } = useOrganization();

  const currentMember =
    session &&
    activeOrganization.members.find(
      (member) => member.userId === session.user.id,
    );

  const sortedMembers = useMemo(() => {
    return activeOrganization.members.sort((a, b) => {
      if (a.role === "owner") return -1;
      if (b.role === "owner") return 1;

      if (a.role === "admin") return -1;
      if (b.role === "admin") return 1;

      return 0;
    });
  }, [activeOrganization.members]);

  return (
    <>
      <div className="grid gap-6">
        {sortedMembers.map((member) => (
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
