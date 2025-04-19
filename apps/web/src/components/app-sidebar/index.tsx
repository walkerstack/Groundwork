import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
import { NavNamespace } from "./nav-namespace";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { OrganizationSwitcher } from "./org-switcher";

export type SidebarItemType = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  adminOnly?: boolean;
  isActive?: boolean;
  exact?: boolean;
  items?: {
    title: string;
    url: string;
    adminOnly?: boolean;
    exact?: boolean;
  }[];
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <div className="flex items-center justify-between px-3 py-2">
        <Image
          src="https://assets.agentset.ai/logo-full.png"
          alt="Agentset"
          height={28}
          width={112}
          className="h-6 w-auto object-contain"
        />
        <NavUser />
      </div>

      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <NavMain />
        <NavNamespace />
      </SidebarContent>

      <SidebarFooter>
        <NavSecondary />
      </SidebarFooter>
    </Sidebar>
  );
}
