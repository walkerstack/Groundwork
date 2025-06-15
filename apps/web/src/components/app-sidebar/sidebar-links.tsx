"use client";

import { useParams } from "next/navigation";

import { dashboardItems, namespaceItems } from "./links";
import { NavItems } from "./nav-items";

export function SidebarLinks() {
  const { namespaceSlug } = useParams();

  if (namespaceSlug) {
    return <NavItems items={namespaceItems} />;
  }

  return <NavItems items={dashboardItems} />;
}
