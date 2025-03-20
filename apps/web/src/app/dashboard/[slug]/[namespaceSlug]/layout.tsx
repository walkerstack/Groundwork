import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { NamespaceProvider } from "@/contexts/namespace-context";

export default async function NamespaceLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string; namespaceSlug: string }>;
  children: React.ReactNode;
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
    <NamespaceProvider activeNamespace={namespace}>
      {children}
    </NamespaceProvider>
  );
}
