import DashboardPageWrapper from "@/components/dashboard-page-wrapper";

import DashboardPage from "./page.client";

// import type { OrganizationParams } from "./get-organization";

export default function NamespacesPage() {
  return (
    <DashboardPageWrapper title="Dashboard">
      <DashboardPage />
    </DashboardPageWrapper>
  );
}
