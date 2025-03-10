"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

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
import { authClient } from "@/lib/auth-client";
import type { Organization } from "@/lib/auth-types";
import { useDashboard } from "@/app/dashboard/dashboard-provider";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import CreateOrganizationDialog from "./create-org-dialog";

const getFallback = (name: string) => {
  return name.charAt(0).toUpperCase();
};

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { activeOrganization, setActiveOrganization } = useDashboard();
  const organizations = authClient.useListOrganizations();
  const [open, setOpen] = React.useState(false);

  const handleOrganizationChange = async (
    organization: Organization | null,
  ) => {
    if (organization?.id === activeOrganization?.id) {
      return;
    }

    const { data } = await authClient.organization.setActive({
      organizationId: organization?.id || null,
    });

    setActiveOrganization(
      organization
        ? {
            ...organization,
            members: [],
            invitations: [],
          }
        : null,
    );

    if (data) {
      setActiveOrganization(data);
    }
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
            >
              <Avatar className="size-8 shrink-0 rounded-lg">
                {activeOrganization?.logo && (
                  <AvatarImage src={activeOrganization.logo} />
                )}
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground rounded-lg">
                  {getFallback(activeOrganization?.name || "Personal")}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrganization?.name || "Personal"}
                </span>
                <span className="truncate text-xs">FREE</span>
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

            <DropdownMenuItem
              onClick={() => handleOrganizationChange(null)}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-sm border">
                <Avatar className="size-4 shrink-0">
                  <AvatarFallback>{getFallback("Personal")}</AvatarFallback>
                </Avatar>
              </div>
              Personal
              <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
            </DropdownMenuItem>

            {organizations.data?.map((organization, index) => (
              <DropdownMenuItem
                key={organization.id}
                onClick={() => handleOrganizationChange(organization)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Avatar className="size-4 shrink-0">
                    {organization.logo && (
                      <AvatarImage src={organization.logo} />
                    )}
                    <AvatarFallback>
                      {getFallback(organization.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {organization.name}
                <DropdownMenuShortcut>⌘{index + 2}</DropdownMenuShortcut>
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
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
