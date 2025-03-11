import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OrganizationProvider } from "@/contexts/organization-context";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const allHeaders = await headers();
  const organization = await auth.api
    .getFullOrganization({
      headers: allHeaders,
      query: {
        organizationSlug: params.slug,
      },
    })
    .catch(() => null);

  if (!organization) {
    notFound();
  }

  return (
    <OrganizationProvider activeOrganization={organization}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </OrganizationProvider>
  );
}
