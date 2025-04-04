import {
  CodeIcon,
  FilesIcon,
  FoldersIcon,
  HelpCircleIcon,
  HomeIcon,
  SettingsIcon,
  // LockIcon,
  WrenchIcon,
} from "lucide-react";

import type { SidebarItemType } from ".";

const createOrgUrl = (url: string) => `/{slug}${url}`;

export const mainItems: SidebarItemType[] = [
  {
    title: "Namespaces",
    url: createOrgUrl("/"),
    icon: FoldersIcon,
    exact: true,
  },
  // {
  //   title: "API Keys",
  //   url: createOrgUrl("/api-keys"),
  //   icon: LockIcon,
  // },
  // {
  //   title: "Settings",
  //   icon: Settings2,
  //   items: [
  //     {
  //       title: "General",
  //       url: createOrgUrl("/settings/general"),
  //     },
  //     {
  //       title: "Team",
  //       url: createOrgUrl("/settings/team"),
  //     },
  //     {
  //       title: "Danger",
  //       url: createOrgUrl("/settings/danger"),
  //       adminOnly: true,
  //     },

  //     // {
  //     //   title: "Billing",
  //     //   url: "/settings/billing",
  //     // },
  //     // {
  //     //   title: "Limits",
  //     //   url: "/settings/limits",
  //     // },
  //   ],
  // },
];

export const secondaryItems: SidebarItemType[] = [
  {
    title: "Settings",
    icon: SettingsIcon,
    url: createOrgUrl("/settings"),
  },
  {
    title: "Get Help",
    icon: HelpCircleIcon,
    url: createOrgUrl("/help"),
  },
];

const createNamespaceUrl = (url: string) => `/{slug}/{namespaceSlug}${url}`;

export const namespaceItems: SidebarItemType[] = [
  {
    title: "Home",
    url: createNamespaceUrl("/"),
    icon: HomeIcon,
    exact: true,
  },
  {
    title: "Ingestion",
    url: createNamespaceUrl("/jobs"),
    icon: WrenchIcon,
  },
  {
    title: "Documents",
    url: createNamespaceUrl("/documents"),
    icon: FilesIcon,
  },
  {
    title: "Playground",
    url: createNamespaceUrl("/playground"),
    icon: CodeIcon,
  },
];
