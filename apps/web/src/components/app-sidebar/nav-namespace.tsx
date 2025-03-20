"use client";

import { useParams } from "next/navigation";

import { namespaceItems } from "./links";
import { NavItems } from "./nav-items";

export function NavNamespace() {
  const slug = useParams().namespaceSlug;
  if (!slug) return null;

  return <NavItems items={namespaceItems} label="Namespace" />;
}
