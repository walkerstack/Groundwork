"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
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
import { useOrganization } from "@/contexts/organization-context";
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react";

import type { SidebarItemType } from ".";

const processUrl = (url: string, slug: string, namespaceSlug?: string) => {
  let newUrl = url.replace("{slug}", slug);
  if (namespaceSlug) {
    newUrl = newUrl.replace("{namespaceSlug}", namespaceSlug);
  }
  return newUrl;
};

export function NavItems({
  items,
  label,
  ...props
}: {
  items: SidebarItemType[];
  label?: string;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const router = useRouter();
  const { slug, namespaceSlug } = useParams();
  const { isAdmin } = useOrganization();

  const pathname = usePathname();

  const isActive = (url: string, exact?: boolean) => {
    if (exact) {
      return pathname === url || `${pathname}/` === url;
    }

    return pathname.startsWith(url);
  };

  return (
    <SidebarGroup {...props}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}

      <SidebarMenu>
        {items.map((item) => {
          const url = processUrl(
            item.url!,
            slug as string,
            namespaceSlug as string,
          );

          if (!item.items && (!item.adminOnly || isAdmin)) {
            return (
              <SidebarMenuButton
                key={item.title}
                asChild
                tooltip={item.title}
                isActive={isActive(url, item.exact)}
              >
                <Link
                  href={url}
                  target={item.external ? "_blank" : undefined}
                  onMouseEnter={() => {
                    router.prefetch(url);
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.external && <ArrowUpRightIcon className="ml-auto" />}
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
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <Link
                      href={url}
                      target={item.external ? "_blank" : undefined}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      if (subItem.adminOnly && !isAdmin) return;
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
