"use client";

import { createContext, useContext, useState } from "react";
import type { ActiveOrganization } from "@/lib/auth-types";
import { useSession } from "./session-context";

type OrganizationContextType = {
  activeOrganization: ActiveOrganization;
  setActiveOrganization: (organization: ActiveOrganization) => void;
};

const OrganizationContext = createContext<OrganizationContextType>(
  null as unknown as OrganizationContextType,
);

export function OrganizationProvider({
  children,
  activeOrganization: initialActiveOrganization,
}: {
  children: React.ReactNode;
  activeOrganization: ActiveOrganization;
}) {
  const [activeOrganization, setActiveOrganization] =
    useState<ActiveOrganization>(initialActiveOrganization);

  return (
    <OrganizationContext.Provider
      value={{ activeOrganization, setActiveOrganization }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within a OrganizationProvider",
    );
  }

  const [{ user }] = useSession();

  return {
    ...context,
    isAdmin: context.activeOrganization?.members.some(
      (member) =>
        (member.role === "admin" || member.role === "owner") &&
        member.userId === user.id,
    ),
  };
}
