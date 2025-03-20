"use client";

import { secondaryItems } from "./links";
import { NavItems } from "./nav-items";

export function NavSecondary() {
  return <NavItems items={secondaryItems} className="mt-auto" />;
}
