"use client";

import { mainItems } from "./links";
import { NavItems } from "./nav-items";

export function NavMain() {
  return <NavItems items={mainItems} />;
}
