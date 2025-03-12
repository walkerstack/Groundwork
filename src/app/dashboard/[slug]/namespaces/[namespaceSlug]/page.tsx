import { notFound } from "next/navigation";
import DashboardPageWrapper from "../../dashboard-page-wrapper";
import { api } from "@/trpc/server";

export default async function NamespacesPage({
  params,
}: {
  params: Promise<{ slug: string; namespaceSlug: string }>;
}) {
  const { slug, namespaceSlug } = await params;
  const namespace = await api.namespace.getNamespaceBySlug({
    slug: namespaceSlug,
    orgSlug: slug,
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
