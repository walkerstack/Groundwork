import { notFound } from "next/navigation";
import { NamespaceProvider } from "@/contexts/namespace-context";
import { trpcApi } from "@/trpc/server";

export default async function NamespaceLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string; namespaceSlug: string }>;
  children: React.ReactNode;
}) {
  const { slug, namespaceSlug } = await params;
  const namespace = await trpcApi.namespace.getNamespaceBySlug({
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
