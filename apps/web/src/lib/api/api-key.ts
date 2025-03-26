import { unstable_cache } from "next/cache";

import { db } from "@agentset/db";

export const getApiKeyInfo = (apiKey: string) => {
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
