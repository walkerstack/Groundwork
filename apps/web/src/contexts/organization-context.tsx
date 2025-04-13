"use client";

import type { ActiveOrganization } from "@/lib/auth-types";
import { createContext, useContext, useState } from "react";
import { authClient } from "@/lib/auth-client";

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
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error(
      "useOrganization must be used within a OrganizationProvider",
    );
  }

  const { data: session } = authClient.useSession();
  let isAdmin = false;
  if (session) {
    const { user } = session;
    isAdmin = context.activeOrganization.members.some(
      (member) =>
        (member.role === "admin" || member.role === "owner") &&
        member.userId === user.id,
    );
  }

  return {
    ...context,
    isAdmin,
  };
}
