import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

import { db } from "@agentset/db";

export type OrganizationParams = Promise<{ slug: string }>;

export const getOrganization = cache(async (slug: string) => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
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
