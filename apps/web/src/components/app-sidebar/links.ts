import {
  AlertTriangleIcon,
  BookIcon,
  ChartNoAxesColumnIcon,
  CircleHelpIcon,
  CreditCardIcon,
  FilesIcon,
  HelpCircleIcon,
  HomeIcon,
  LockIcon,
  MessagesSquareIcon,
  RocketIcon,
  SettingsIcon,
  UnplugIcon,
  UsersIcon,
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
    title: "Quick Start",
    url: createNamespaceUrl("/quick-start"),
    icon: RocketIcon,
    exact: true,
  },
  {
    title: "Dashboard",
    url: createNamespaceUrl("/"),
    icon: HomeIcon,
    exact: true,
  },
  {
    title: "Documents",
    url: createNamespaceUrl("/documents"),
    icon: FilesIcon,
  },
  {
    title: "Connectors",
    url: createNamespaceUrl("/connectors"),
    icon: UnplugIcon,
  },
  {
    title: "Benchmarks",
    url: createNamespaceUrl("/benchmarks"),
    icon: ChartNoAxesColumnIcon,
  },
  {
    title: "Playground",
    url: createNamespaceUrl("/playground"),
    icon: MessagesSquareIcon,
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

export const supportItems: SidebarItemType[] = [
  {
    title: "Docs",
    url: "https://docs.agentset.ai",
    icon: BookIcon,
    external: true,
  },
  {
    title: "Help",
    url: "mailto:support@agentset.ai",
    icon: CircleHelpIcon,
    external: true,
  },
];
