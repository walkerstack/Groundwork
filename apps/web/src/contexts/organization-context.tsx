"use client";

import { createContext, use, useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";

import type { Invitation, Member, Organization, User } from "@agentset/db";

type ActiveOrganization = Organization & {
  members: (Member & {
    user: User;
  })[];
  invitations: Invitation[];
};

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

  useEffect(() => {
    setActiveOrganization(initialActiveOrganization);
  }, [initialActiveOrganization]);

  return (
    <OrganizationContext.Provider
      value={{ activeOrganization, setActiveOrganization }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = use(OrganizationContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error(
      "useOrganization must be used within a OrganizationProvider",
    );
  }

  const { session } = useSession();
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
