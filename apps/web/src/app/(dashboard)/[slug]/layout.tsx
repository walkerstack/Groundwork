import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ModalProvider } from "@/components/modals";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OrganizationProvider } from "@/contexts/organization-context";
import { auth } from "@/lib/auth";
import { constructMetadata } from "@/lib/metadata";

import { db } from "@agentset/db";

const getOrg = cache(async (slug: string) => {
  const allHeaders = await headers();
  const session = await auth.api
    .getSession({
      headers: allHeaders,
    })
    .catch(() => null);

  // organization.
  if (!session) {
    notFound();
  }

  const org = await db.organization.findUnique({
    where: {
      slug,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      invitations: true,
    },
  });

  if (!org) {
    notFound();
  }

  return org;
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
      <ModalProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </ModalProvider>
    </OrganizationProvider>
  );
}
