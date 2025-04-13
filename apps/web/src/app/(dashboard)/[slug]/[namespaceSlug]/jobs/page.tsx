import DashboardPageWrapper from "../../dashboard-page-wrapper";
import { IngestModal } from "./ingest-modal";
import JobsPageClient from "./page.client";

export default function JobsPage() {
  return (
    <DashboardPageWrapper title="Ingestion Jobs">
      <div className="mb-10">
        <IngestModal />
      </div>

      <JobsPageClient />
    </DashboardPageWrapper>
  );
}
