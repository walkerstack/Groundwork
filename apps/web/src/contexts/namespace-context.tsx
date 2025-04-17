"use client";

import { createContext, useContext, useState } from "react";

import type { Namespace } from "@agentset/db";

import { useOrganization } from "./organization-context";

interface NamespaceContextType {
  activeNamespace: Namespace;
  setActiveNamespace: (namespace: Namespace) => void;
}

const NamespaceContext = createContext<NamespaceContextType>(
  null as unknown as NamespaceContextType,
);

export function NamespaceProvider({
  children,
  activeNamespace: initialActiveNamespace,
}: {
  children: React.ReactNode;
  activeNamespace: Namespace;
}) {
  const [activeNamespace, setActiveNamespace] = useState<Namespace>(
    initialActiveNamespace,
  );

  return (
    <NamespaceContext.Provider value={{ activeNamespace, setActiveNamespace }}>
      {children}
    </NamespaceContext.Provider>
  );
}

export function useNamespace() {
  const context = useContext(NamespaceContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error("useNamespace must be used within a NamespaceProvider");
  }

  const { activeOrganization } = useOrganization();

  return {
    ...context,
    organization: activeOrganization,
    baseUrl: `/${activeOrganization.slug}/${context.activeNamespace.slug}`,
  };
}
