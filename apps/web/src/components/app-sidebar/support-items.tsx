"use client";

import { BookIcon, CircleHelpIcon } from "lucide-react";

import { NavItems } from "./nav-items";

export function SupportItems() {
  return (
    <NavItems
      items={[
        {
          title: "Docs",
          url: "https://docs.agentset.ai",
          icon: BookIcon,
          external: true,
        },
        {
          title: "Help",
          url: "mailto:support@agentset.ai",
          icon: CircleHelpIcon,
          external: true,
        },
      ]}
    />
  );
}
