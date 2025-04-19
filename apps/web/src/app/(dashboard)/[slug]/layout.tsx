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
      {children}
    </OrganizationProvider>
  );
}
