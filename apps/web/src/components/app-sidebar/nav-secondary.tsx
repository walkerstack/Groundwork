"use client";

import { useParams, usePathname } from "next/navigation";

import { secondaryItems } from "./links";
import { NavItems } from "./nav-items";

export function NavSecondary() {
  const { slug } = useParams();
  const pathname = usePathname();
  const isSettings = pathname.startsWith(`/${slug}/settings`);

  return (
    <NavItems
      items={
        isSettings
          ? secondaryItems.filter((item) => item.title !== "Settings")
          : secondaryItems
      }
      className="mt-auto"
    />
  );
}
