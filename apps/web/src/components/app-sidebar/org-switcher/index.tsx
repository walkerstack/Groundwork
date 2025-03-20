"use client";

import type { Organization } from "@/lib/auth-types";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ChevronsUpDown, Plus } from "lucide-react";

import CreateOrganizationDialog from "./create-org-dialog";

const getFallback = (name: string) => {
  return name.charAt(0).toUpperCase();
};

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { activeOrganization, setActiveOrganization } = useOrganization();
  const organizations = authClient.useListOrganizations();
  const [open, setOpen] = React.useState(false);

  const handleOrganizationChange = async (organization: Organization) => {
    if (organization.id === activeOrganization.id) {
      return;
    }

    setActiveOrganization({
      ...organization,
      members: [],
      invitations: [],
    });

    const { data } = await authClient.organization.setActive({
      organizationId: organization.id,
    });

    if (data) {
      router.push(`/dashboard/${data.slug}`);
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
                {activeOrganization.logo && (
                  <AvatarImage src={activeOrganization.logo} />
                )}
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground rounded-lg">
                  {getFallback(activeOrganization.name)}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrganization.name}
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
