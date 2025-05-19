import { AppSidebar } from "@/components/app-sidebar";
import { ModalProvider } from "@/components/modals";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OrganizationProvider } from "@/contexts/organization-context";

import type { OrganizationParams } from "./get-organization";
import { getOrganization } from "./get-organization";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: OrganizationParams;
}) {
  const { slug } = await params;
  const organization = await getOrganization(slug);

  return (
    <OrganizationProvider activeOrganization={organization}>
      <ModalProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </ModalProvider>
    </OrganizationProvider>
  );
}
