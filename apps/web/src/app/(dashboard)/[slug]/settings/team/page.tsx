import { Separator } from "@/components/ui/separator";
import { constructMetadata } from "@/lib/metadata";

import InviteMemberDialog from "./invite-dialog";
import TeamSettingsPage from "./page.client";

export const metadata = constructMetadata({ title: "Team" });

export default function TeamSettingsPageServer() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Team Members</h2>
          <p className="text-muted-foreground text-sm">
            Invite your team members to collaborate.
          </p>
        </div>

        <InviteMemberDialog />
      </div>

      <Separator className="my-4" />

      <TeamSettingsPage />
    </>
  );
}
