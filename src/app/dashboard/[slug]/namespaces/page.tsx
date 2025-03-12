import DashboardPageWrapper from "../dashboard-page-wrapper";
import CreateNamespace from "./create-namespace";
import NamespacesList from "./namespaces-list";

export default function NamespacesPage() {
  return (
    <DashboardPageWrapper title="Namespaces">
      <div className="mb-10">
        <CreateNamespace />
      </div>

      <NamespacesList />
    </DashboardPageWrapper>
  );
}
