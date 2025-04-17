"use client";

import type { RouterOutputs } from "@/trpc/react";
import { useState } from "react";
import { EntityAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrganization } from "@/contexts/organization-context";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/react";
import { useRouter } from "@bprogress/next/app";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";

import CreateOrganizationDialog from "./create-org-dialog";

type Organization = RouterOutputs["organization"]["getOrganizations"][number];

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const {
    activeOrganization,
    setActiveOrganization: setActiveOrganizationInContext,
  } = useOrganization();
  const trpc = useTRPC();
  const { data: organizations } = useQuery(
    trpc.organization.getOrganizations.queryOptions(),
  );
  const [open, setOpen] = useState(false);

  const { mutateAsync: setActiveOrganization, isPending } = useMutation({
    onMutate(organization) {
      // optimistic update
      setActiveOrganizationInContext(organization);
    },
    mutationFn: async (organization: Organization) => {
      return authClient.organization.setActive({
        organizationId: organization.id,
      });
    },
    onSuccess: (data, organization) => {
      router.push(`/${(data.data || organization).slug}`);
      setActiveOrganizationInContext(organization);
    },
    onError: () => {
      toast.error("Failed to switch organization!");
    },
  });

  const handleOrganizationChange = async (organization: Organization) => {
    if (organization.id === activeOrganization.id || isPending) {
      return;
    }

    await setActiveOrganization(organization);
  };

  return (
    <SidebarMenu>
      <CreateOrganizationDialog open={open} setOpen={setOpen} />

      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isPending}
            >
              <EntityAvatar entity={activeOrganization} />

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrganization.name}
                </span>
                <span className="truncate text-xs">
                  {activeOrganization.plan.toUpperCase()}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>

            {organizations?.map((organization, index) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={() => handleOrganizationChange(organization)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <EntityAvatar
                    entity={organization}
                    className="size-4 shrink-0 rounded-none"
                    fallbackClassName="bg-transparent rounded-none text-foreground"
                  />
                </div>
                {organization.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setOpen(true)}
            >
              <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
