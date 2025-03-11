"use client";

import DashboardPageWrapper from "../dashboard-page-wrapper";
import { useOrganization } from "@/contexts/organization-context";
import CreateNamespace from "./create-namespace";
import NamespacesList from "./namespaces-list";

export default function NamespacesPage() {
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) {
    return <div>No organization selected</div>;
  }

  return (
    <DashboardPageWrapper title="Namespaces">
      <div className="mb-10">
        <CreateNamespace orgId={activeOrganization.id} />
      </div>
      <NamespacesList orgId={activeOrganization.id} />
    </DashboardPageWrapper>
  );
}
