import { unstable_cache } from "next/cache";

import { db } from "@agentset/db";

export const getApiKeyScopeAndOrganizationId = (apiKey: string) => {
  return unstable_cache(
    async () => {
      const data = await db.organizationApiKey.findUnique({
        where: {
          key: apiKey,
        },
        select: {
          scope: true,
          organizationId: true,
        },
      });

      return data;
    },
    ["apiKey", apiKey],
    {
      tags: [`apiKey:${apiKey}`],
      revalidate: 60 * 30, // 30 mins
    },
  )();
};

export const getNamespaceConfig = async (
  namespaceId: string,
  orgId: string,
) => {
  return unstable_cache(
    async () => {
      const data = await db.namespace.findUnique({
        where: {
          id: namespaceId,
          organizationId: orgId,
        },
        select: {
          id: true,
          vectorStoreConfig: true,
          embeddingConfig: true,
        },
      });

      return data;
    },
    ["namespace", namespaceId, orgId],
    {
      tags: [`namespace:${namespaceId}`, `org:${orgId}`],
      revalidate: 60 * 30, // 30 mins
    },
  )();
};
