import DashboardPageWrapper from "@/components/dashboard-page-wrapper";

import AddConnector from "./add-connector";
import ConnectorsPageClient from "./page.client";

export default function ConnectorsPage() {
  return (
    <DashboardPageWrapper title="Connectors">
      {/* <div className="flex items-center justify-end">
        <AddConnector />
      </div> */}

      <div className="mt-6">
        <ConnectorsPageClient />
      </div>
    </DashboardPageWrapper>
  );
}
