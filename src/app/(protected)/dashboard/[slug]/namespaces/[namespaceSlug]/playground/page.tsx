import { notFound } from "next/navigation";
import DashboardPageWrapper from "../../../dashboard-page-wrapper";
import { api } from "@/trpc/server";
import Chat from "./chat";

export default async function PlaygroundPage({
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
    <DashboardPageWrapper title="Playground">
      <Chat namespace={namespace} />
    </DashboardPageWrapper>
  );
}
