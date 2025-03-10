"use client";

import { Button } from "@/components/ui/button";
import {
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import { useDashboard } from "../../dashboard-provider";
import { MailPlusIcon } from "lucide-react";
import type { ActiveOrganization } from "@/lib/auth-types";

function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const { activeOrganization, setActiveOrganization } = useDashboard();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);

    const invite = authClient.organization.inviteMember({
      email: email,
      role: role as "member",
      fetchOptions: {
        throw: true,
        onSuccess: (ctx) => {
          if (activeOrganization) {
            setActiveOrganization({
              ...activeOrganization,
              invitations: [
                ...(activeOrganization?.invitations || []),
                ctx.data as ActiveOrganization["invitations"][number],
              ],
            });
          }
        },
      },
    });

    toast.promise(invite, {
      loading: "Inviting member...",
      success: "Member invited successfully",
      error: (error: { error?: { message?: string } }) =>
        error?.error?.message || "Failed to invite member",
    });

    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full gap-2" variant="secondary">
          <MailPlusIcon size={16} />
          <p>Invite Member</p>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite a member to your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button disabled={loading} onClick={handleInvite}>
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InviteMemberDialog;
