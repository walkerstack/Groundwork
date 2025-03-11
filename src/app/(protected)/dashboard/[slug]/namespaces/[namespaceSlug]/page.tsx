import { notFound } from "next/navigation";
import DashboardPageWrapper from "../../dashboard-page-wrapper";
import { api } from "@/trpc/server";

export default async function NamespacesPage({
  params,
}: {
  params: { slug: string; namespaceSlug: string };
}) {
  const namespace = await api.namespace.getNamespaceBySlug({
    slug: params.namespaceSlug,
    orgSlug: params.slug,
  });

  if (!namespace) {
    notFound();
  }

  return (
    <DashboardPageWrapper title={namespace.name}>
      {JSON.stringify(namespace)}
    </DashboardPageWrapper>
  );
}
