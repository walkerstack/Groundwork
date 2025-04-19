"use client";

import type { RouterOutputs } from "@/trpc/react";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EntityAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { ChevronsUpDownIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import CreateNamespaceDialog from "./create-namespace-dialog";
import CreateOrganizationDialog from "./create-org-dialog";

type Organization = RouterOutputs["organization"]["getOrganizations"][number];
type Namespace = Organization["namespaces"][number];

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { activeOrganization } = useOrganization();
  const { namespaceSlug } = useParams();

  const trpc = useTRPC();
  const { data: organizations } = useQuery(
    trpc.organization.getOrganizations.queryOptions(),
  );

  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [createNamespaceOrg, setCreateNamespaceOrg] =
    useState<null | Organization>(null);

  const { mutateAsync: setActiveOrganization, isPending } = useMutation({
    mutationFn: async (organization: Organization) => {
      const result = await authClient.organization.setActive({
        organizationId: organization.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onError: () => {
      toast.error("Failed to switch organization!");
    },
  });

  const handleNamespaceChange = async (
    organization: Organization,
    namespace: Namespace,
  ) => {
    if (isPending || namespace.slug === namespaceSlug) {
      return;
    }

    if (organization.id !== activeOrganization.id) {
      await setActiveOrganization(organization);
    }

    router.push(`/${organization.slug}/${namespace.slug}`);
  };

  const activeNamespace = useMemo(() => {
    if (!organizations || !namespaceSlug) return null;
    return organizations
      .flatMap((org) => org.namespaces)
      .find((ns) => ns.slug === namespaceSlug);
  }, [organizations, namespaceSlug]);

  return (
    <SidebarMenu>
      <CreateOrganizationDialog
        open={createOrgOpen}
        setOpen={setCreateOrgOpen}
      />

      <CreateNamespaceDialog
        organization={createNamespaceOrg}
        open={!!createNamespaceOrg}
        setOpen={(open) =>
          setCreateNamespaceOrg(open ? createNamespaceOrg : null)
        }
      />

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
                {activeNamespace ? (
                  <>
                    <span className="truncate font-semibold">
                      {activeNamespace.name}
                    </span>

                    <span className="truncate text-xs">
                      {activeOrganization.name}
                    </span>
                  </>
                ) : (
                  <span className="truncate font-semibold">
                    {activeOrganization.name}
                  </span>
                )}
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
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

            {organizations?.map((organization) => (
              <OrganizationMenuItem
                key={organization.id}
                organization={organization}
                handleNamespaceChange={handleNamespaceChange}
                setCreateNamespaceOrg={setCreateNamespaceOrg}
              />
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2" asChild>
              <Link href={`/${activeOrganization.slug}/settings`}>
                <SettingsIcon className="size-4" />

                <div className="text-muted-foreground font-medium">
                  Settings
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setCreateOrgOpen(true)}
            >
              <PlusIcon className="size-4" />

              <div className="text-muted-foreground font-medium">
                New Organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const OrganizationMenuItem = ({
  organization,
  handleNamespaceChange,
  setCreateNamespaceOrg,
}: {
  organization: Organization;
  handleNamespaceChange: (
    organization: Organization,
    namespace: Namespace,
  ) => void;
  setCreateNamespaceOrg: (organization: Organization) => void;
}) => {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2 p-2">
        <EntityAvatar
          entity={organization}
          className="border-border size-8 shrink-0 rounded-sm border"
          fallbackClassName="bg-transparent rounded-none text-foreground"
        />

        <div>
          <p>{organization.name}</p>
          <p className="text-muted-foreground text-xs">
            {organization.plan.toUpperCase()}
          </p>
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="min-w-50">
          {organization.namespaces.length > 0 ? (
            organization.namespaces.map((namespace) => (
              <DropdownMenuItem
                key={namespace.id}
                className="gap-2 px-2 py-2.5"
                onClick={() => handleNamespaceChange(organization, namespace)}
              >
                <span>{namespace.name}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="text-muted-foreground py-2 text-center text-xs">
              No namespaces
            </p>
          )}
          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="gap-2 p-2"
            onClick={() => setCreateNamespaceOrg(organization)}
          >
            <PlusIcon className="size-4" />

            <div className="text-muted-foreground font-medium">
              New Namespace
            </div>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};
