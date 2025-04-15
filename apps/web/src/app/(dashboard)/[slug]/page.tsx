import DashboardPageWrapper from "./dashboard-page-wrapper";
import NamespacesList from "./namespaces-list";

export default function NamespacesPage() {
  return (
    <DashboardPageWrapper title="Namespaces">
      <NamespacesList />
    </DashboardPageWrapper>
  );
}
