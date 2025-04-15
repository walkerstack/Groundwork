"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { SidebarMenuButton } from "../ui/sidebar";
import { mainItems, settingsItems } from "./links";
import { NavItems } from "./nav-items";

export function NavMain() {
  const pathname = usePathname();
  const { slug } = useParams();

  const isSettings = pathname.startsWith(`/${slug}/settings`);

  if (isSettings) {
    return (
      <>
        <SidebarMenuButton asChild tooltip="Back">
          <Link href={`/${slug}`}>
            <ArrowLeftIcon />
            <span>Back</span>
          </Link>
        </SidebarMenuButton>
        <NavItems items={settingsItems} label="Settings" />
      </>
    );
  }

  return <NavItems items={mainItems} />;
}
