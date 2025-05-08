import DashboardPageWrapper from "@/components/dashboard-page-wrapper";

import { IngestModal } from "./ingest-modal";
import JobsPageClient from "./page.client";

export default function DocumentsPage() {
  return (
    <DashboardPageWrapper title="Documents">
      <div className="mb-10">
        <IngestModal />
      </div>

      <JobsPageClient />
    </DashboardPageWrapper>
  );
}
