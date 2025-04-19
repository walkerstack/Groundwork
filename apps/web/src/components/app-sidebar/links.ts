import {
  AlertTriangleIcon,
  CodeIcon,
  CreditCardIcon,
  FilesIcon,
  HelpCircleIcon,
  HomeIcon,
  LockIcon,
  SettingsIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";

import type { SidebarItemType } from ".";

const createOrgUrl = (url: string) => `/{slug}${url}`;

export const secondaryItems: SidebarItemType[] = [
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

export const settingsItems: SidebarItemType[] = [
  {
    title: "General",
    url: createOrgUrl("/settings"),
    icon: SettingsIcon,
    exact: true,
  },
  {
    title: "API Keys",
    url: createOrgUrl("/settings/api-keys"),
    icon: LockIcon,
  },
  {
    title: "Team",
    url: createOrgUrl("/settings/team"),
    icon: UsersIcon,
  },
  {
    title: "Billing",
    url: createOrgUrl("/settings/billing"),
    icon: CreditCardIcon,
  },
  {
    title: "Danger",
    url: createOrgUrl("/settings/danger"),
    icon: AlertTriangleIcon,
    adminOnly: true,
  },
];
