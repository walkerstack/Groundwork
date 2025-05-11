import type { LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { NavMain } from "./nav-main";
import { NavNamespace } from "./nav-namespace";
import { NavSecondary } from "./nav-secondary";
import { OrganizationSwitcher } from "./org-switcher";
import { SupportItems } from "./support-items";

export type SidebarItemType = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  external?: boolean;
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

      <SidebarFooter className="px-0">
        <SupportItems />
      </SidebarFooter>

      <SidebarSeparator className="mr-0 -ml-2 w-[calc(100%+1rem)]!" />

      <SidebarFooter className="pb-10">
        <NavSecondary />
      </SidebarFooter>
    </Sidebar>
  );
}
