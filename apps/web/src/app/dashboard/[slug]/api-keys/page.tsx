"use client";

import DashboardPageWrapper from "../dashboard-page-wrapper";
import { useOrganization } from "@/contexts/organization-context";
import ApiKeysList from "./api-keys-list";
import CreateApiKey from "./create-api-key";

export default function ApiKeysPage() {
  const { activeOrganization, isAdmin } = useOrganization();

  if (!activeOrganization) {
    return <div>No organization selected</div>;
  }

  if (!isAdmin) {
    return <div>You are not authorized to view this page</div>;
  }

  return (
    <DashboardPageWrapper title="API Keys">
      <div className="mb-10">
        <CreateApiKey orgId={activeOrganization.id} />
      </div>
      <ApiKeysList orgId={activeOrganization.id} />
    </DashboardPageWrapper>
  );
}
