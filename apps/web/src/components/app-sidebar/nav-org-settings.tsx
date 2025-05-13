"use client";

import { useParams, usePathname } from "next/navigation";

import { settingsItems } from "./links";
import { NavItems } from "./nav-items";

export function NavOrgSettings() {
  const pathname = usePathname();
  const { slug } = useParams();

  const isSettings = pathname.startsWith(`/${slug}/settings`);

  if (!isSettings) {
    return null;
  }

  return <NavItems items={settingsItems} />;
}
