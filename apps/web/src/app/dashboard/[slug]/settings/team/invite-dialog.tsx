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
import { useOrganization } from "@/contexts/organization-context";
import type { ActiveOrganization, Role } from "@/lib/auth-types";
import { useMutation } from "@tanstack/react-query";

function InviteMemberDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { activeOrganization, setActiveOrganization } = useOrganization();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const { mutateAsync: invite, isPending } = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const res = await authClient.organization.inviteMember({
        email: email,
        role: role as Role,
        organizationId: activeOrganization.id,
      });

      if (res.error || !res.data) {
        throw new Error(res.error?.message || "Failed to invite member");
      }

      return res.data;
    },
    onSuccess: (result) => {
      setActiveOrganization({
        ...activeOrganization,
        invitations: [
          ...(activeOrganization?.invitations || []),
          result as ActiveOrganization["invitations"][number],
        ],
      });

      setOpen(false);
    },
  });

  const handleInvite = async () => {
    toast.promise(invite({ email, role }), {
      loading: "Inviting member...",
      success: "Member invited successfully",
      error: (error: { error?: { message?: string } }) =>
        error?.error?.message || "Failed to invite member",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite a member to your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
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
        </div>
        <DialogFooter>
          <Button isLoading={isPending} onClick={handleInvite}>
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InviteMemberDialog;
