import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ModalProvider } from "@/components/modals";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
      <ModalProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </ModalProvider>
    </NamespaceProvider>
  );
}
