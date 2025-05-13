"use client";

import { useParams } from "next/navigation";

import { namespaceItems } from "./links";
import { NavItems } from "./nav-items";

export function NavNamespace() {
  const { namespaceSlug } = useParams();
  if (!namespaceSlug) return null;

  return <NavItems items={namespaceItems} />;
}
