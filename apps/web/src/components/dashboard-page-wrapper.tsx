"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNamespace } from "@/contexts/namespace-context";
import { useOrganization } from "@/contexts/organization-context";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";

import { Namespace } from "@agentset/db";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SidebarTrigger,
} from "@agentset/ui";

import { NavUser } from "./app-sidebar/nav-user";
import CreateNamespaceDialog from "./create-namespace";

const NamespaceSwitcher = () => {
  const { activeNamespace } = useNamespace();
  const { activeOrganization } = useOrganization();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const trpc = useTRPC();
  const {
    data: namespaces,
    isLoading,
    error,
  } = useQuery(
    trpc.namespace.getOrgNamespaces.queryOptions({
      orgId: activeOrganization.id,
    }),
  );

  const handleNamespaceChange = (namespace: Namespace) => {
    router.push(`/${activeOrganization.slug}/${namespace.slug}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="focus-visible:bg-accent text-foreground h-8 px-0! focus-visible:ring-0"
          >
            <span className="text-muted-foreground truncate text-sm font-medium">
              {activeNamespace.name}
            </span>
            <ChevronsUpDownIcon className="text-muted-foreground/80 size-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          {namespaces?.map((namespace) => (
            <DropdownMenuItem
              className="gap-2 p-2"
              key={namespace.id}
              onClick={() => handleNamespaceChange(namespace)}
            >
              <p>{namespace.name}</p>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem className="gap-2 p-2" onClick={() => setOpen(true)}>
            <PlusIcon className="size-4" />

            <div className="text-muted-foreground font-medium">
              New Namespace
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateNamespaceDialog
        organization={activeOrganization}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
};

export default function DashboardPageWrapper({
  children,
  title,
  titleActions,
  className,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  titleActions?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  const { namespaceSlug } = useParams();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          {namespaceSlug ? (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <NamespaceSwitcher />
                </BreadcrumbItem>
                <BreadcrumbSeparator>/</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <h1 className="text-foreground text-sm font-medium">
                    {title}
                  </h1>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            <h1 className="text-base font-medium">{title}</h1>
          )}

          {titleActions}
        </div>

        <div className="flex items-center gap-2">
          {actions}
          <NavUser />
        </div>
      </header>

      <div className={cn("flex flex-1 flex-col px-8 py-10", className)}>
        {children}
      </div>
    </>
  );
}
