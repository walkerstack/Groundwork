import { redirect } from "next/navigation";

import { db } from "@agentset/db";

import type { OrganizationParams } from "./get-organization";
import { getOrganization } from "./get-organization";

export default async function NamespacesPage({
  params,
}: {
  params: OrganizationParams;
}) {
  const { slug } = await params;
  const organization = await getOrganization(slug);
  const firstNamespace = await db.namespace.findFirst({
    where: {
      organizationId: organization.id,
    },
  });

  if (firstNamespace) {
    redirect(`/${organization.slug}/${firstNamespace.slug}`);
  }

  redirect(`/${organization.slug}/create-namespace`);
}
