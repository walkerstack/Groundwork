"use client";

import { createContext, useContext, useState } from "react";
import type { ActiveOrganization, Session } from "@/lib/auth-types";

type DashboardContextType = {
  session: Session;
  activeOrganization: ActiveOrganization | null;
  setActiveOrganization: (organization: ActiveOrganization | null) => void;
};

const DashboardContext = createContext<DashboardContextType>(
  null as unknown as DashboardContextType,
);

export function DashboardProvider({
  children,
  activeOrganization: initialActiveOrganization,
  session,
}: {
  children: React.ReactNode;
  activeOrganization: ActiveOrganization | null;
  session: Session;
}) {
  const [activeOrganization, setActiveOrganization] =
    useState<ActiveOrganization | null>(initialActiveOrganization);

  return (
    <DashboardContext.Provider
      value={{ activeOrganization, session, setActiveOrganization }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }

  return {
    ...context,
    isAdmin: context.activeOrganization?.members.some(
      (member) => member.role === "admin" || member.role === "owner",
    ),
  };
}
