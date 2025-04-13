import DashboardPageWrapper from "../../dashboard-page-wrapper";
import DocumentsPageClient from "./page.client";

export default function DocumentsPage() {
  return (
    <DashboardPageWrapper title="Documents">
      <DocumentsPageClient />
    </DashboardPageWrapper>
  );
}
