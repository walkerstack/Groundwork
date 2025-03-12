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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allHeaders = await headers();
  const organization = await auth.api
    .getFullOrganization({
      headers: allHeaders,
      query: {
        organizationSlug: slug,
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
