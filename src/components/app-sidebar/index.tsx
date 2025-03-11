"use client";

import * as React from "react";
import { FoldersIcon, LockIcon, Settings2 } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useParams } from "next/navigation";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Namespaces",
      url: "/dashboard/{slug}/namespaces",
      icon: FoldersIcon,
    },
    {
      title: "API Keys",
      url: "/dashboard/{slug}/api-keys",
      icon: LockIcon,
    },
    {
      title: "Settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/{slug}/settings/general",
        },
        {
          title: "Team",
          url: "/dashboard/{slug}/settings/team",
        },

        // {
        //   title: "Billing",
        //   url: "/dashboard/settings/billing",
        // },
        // {
        //   title: "Limits",
        //   url: "/dashboard/settings/limits",
        // },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
