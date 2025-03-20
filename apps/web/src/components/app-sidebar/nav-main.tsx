"use client";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useOrganization } from "@/contexts/organization-context";
import { FoldersIcon, LockIcon, Settings2 } from "lucide-react";
import type { SidebarItemType } from ".";

const createOrgUrl = (url: string) => `/dashboard/{slug}${url}`;

// This is sample data.
const items: SidebarItemType[] = [
  {
    title: "Namespaces",
    url: createOrgUrl("/"),
    icon: FoldersIcon,
    exact: true,
  },
  {
    title: "API Keys",
    url: createOrgUrl("/api-keys"),
    icon: LockIcon,
  },
  {
    title: "Settings",
    icon: Settings2,
    items: [
      {
        title: "General",
        url: createOrgUrl("/settings/general"),
      },
      {
        title: "Team",
        url: createOrgUrl("/settings/team"),
      },
      {
        title: "Danger",
        url: createOrgUrl("/settings/danger"),
        adminOnly: true,
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
];

const processUrl = (url: string, slug: string) => {
  return url.replace("{slug}", slug);
};

export function NavMain() {
  const slug = useParams().slug;
  const { isAdmin } = useOrganization();

  const pathname = usePathname();

  const isActive = (url: string, exact?: boolean) => {
    if (exact) {
      return pathname === url || `${pathname}/` === url;
    }

    return pathname.startsWith(url);
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (!item.items && (!item.adminOnly || isAdmin)) {
            const url = processUrl(item.url!, slug as string);
            return (
              <SidebarMenuButton
                key={item.title}
                asChild
                tooltip={item.title}
                isActive={isActive(url, item.exact)}
              >
                <Link href={url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      if (subItem.adminOnly && !isAdmin) return;
                      const url = processUrl(subItem.url, slug as string);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive(url, subItem.exact)}
                          >
                            <Link href={url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
