import type { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
import { NavNamespace } from "./nav-namespace";
import { NavSecondary } from "./nav-secondary";
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
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
        <NavNamespace />
      </SidebarContent>

      <SidebarFooter className="pb-5">
        <NavSecondary />
      </SidebarFooter>
    </Sidebar>
  );
}
