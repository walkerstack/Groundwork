import { toSlug } from "@/lib/slug";

import { db } from "@agentset/db";

export const createNamespace = async ({
  name,
  organizationId,
  slug: _slug,
}: {
  name: string;
  slug?: string;
  organizationId: string;
}) => {
  const slug = _slug ?? toSlug(name);

  const namespace = await db.namespace.create({
    data: { name, slug, organizationId },
  });

  return namespace;
};
