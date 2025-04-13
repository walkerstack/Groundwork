import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OrganizationProvider } from "@/contexts/organization-context";
import { auth } from "@/lib/auth";
import { constructMetadata } from "@/lib/metadata";

const getOrg = cache(async (slug: string) => {
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

  return organization;
});

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const organization = await getOrg(slug);

  return constructMetadata({ title: organization.name });
};

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organization = await getOrg(slug);

  return (
    <OrganizationProvider activeOrganization={organization}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </OrganizationProvider>
  );
}
