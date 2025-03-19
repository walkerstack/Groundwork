"use client";

import {
  ChevronRight,
  CodeIcon,
  FilesIcon,
  HomeIcon,
  WrenchIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { SidebarItemType } from ".";

const createNamespaceUrl = (url: string) =>
  `/dashboard/{slug}/{namespaceSlug}${url}`;

const items: SidebarItemType[] = [
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

export function NavNamespace() {
  const slug = useParams().namespaceSlug;
  if (!slug) return null;

  return <NavNamespaceInner />;
}

const processUrl = (url: string, slug: string, namespaceSlug: string) => {
  return url.replace("{slug}", slug).replace("{namespaceSlug}", namespaceSlug);
};

function NavNamespaceInner() {
  const { slug, namespaceSlug } = useParams();
  const pathname = usePathname();

  const isActive = (url: string, exact?: boolean) => {
    if (exact) {
      return pathname === url || `${pathname}/` === url;
    }

    return pathname.startsWith(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Namespace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (!item.items) {
            const url = processUrl(
              item.url!,
              slug as string,
              namespaceSlug as string,
            );
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
                      const url = processUrl(
                        subItem.url,
                        slug as string,
                        namespaceSlug as string,
                      );
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
