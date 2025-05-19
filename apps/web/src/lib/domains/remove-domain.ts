import { env } from "@/env";

import { db } from "@agentset/db";

import { callVercelApi, getApexDomain } from "./utils";

export const removeDomainFromVercel = async (domain: string) => {
  const apexDomain = getApexDomain(`https://${domain}`);
  const domains = await db.domain.findMany({
    where: {
      OR: [
        {
          slug: apexDomain,
        },
        {
          slug: {
            endsWith: `.${apexDomain}`,
          },
        },
      ],
    },
    select: {
      slug: true,
    },
  });

  // if there are other subdomains or the apex domain itself is in use
  // so we should only remove it from our Vercel project

  if (domains.filter((d) => d.slug !== domain).length > 0) {
    return callVercelApi<{
      error?: { code: string; message: string };
    }>(
      `/v9/projects/${env.VERCEL_PROJECT_ID}/domains/${domain.toLowerCase()}`,
      "DELETE",
    );
  } else {
    // if this is the only domain that is in use
    // we can remove it entirely from our Vercel team
    return callVercelApi<{
      error?: { code: string; message: string };
    }>(`/v6/domains/${domain.toLowerCase()}`, "DELETE");
  }
};
