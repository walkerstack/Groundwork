"use client";

import { api } from "@/trpc/react";
import DashboardPageWrapper from "../../dashboard-page-wrapper";
import { useDashboard } from "../../dashboard-provider";
import { useParams } from "next/navigation";

export default function NamespacesPage() {
  const { slug } = useParams();
  const { activeOrganization } = useDashboard();
  const { data: namespace, isLoading } =
    api.namespace.getNamespaceBySlug.useQuery(
      {
        slug: slug as string,
        orgId: activeOrganization?.id as string,
      },
      { enabled: !!activeOrganization },
    );

  if (!activeOrganization) {
    return <div>No organization selected</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!namespace) {
    return <div>Namespace not found</div>;
  }

  return (
    <DashboardPageWrapper title={namespace.name}>
      {JSON.stringify(namespace)}
    </DashboardPageWrapper>
  );
}
