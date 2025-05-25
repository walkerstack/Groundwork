import { cache } from "react";
import { notFound } from "next/navigation";
import Chat from "@/components/chat";
import { HostingProvider } from "@/contexts/hosting-context";
import { constructMetadata } from "@/lib/metadata";

import { db } from "@agentset/db";

import Header from "./header";

const getHosting = cache(async (domain: string) => {
  return await db.hosting.findFirst({
    where: {
      domain: {
        slug: domain,
      },
    },
    include: {
      namespace: {
        select: {
          organization: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const hosting = await getHosting(domain);

  if (!hosting) return {};

  return {
    title: constructMetadata({ title: hosting.namespace.organization.name }),
  };
}

export default async function CustomDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const hosting = await getHosting(domain);

  if (!hosting) notFound();

  // TODO: Implement protected hosting
  return (
    <HostingProvider hosting={hosting}>
      <div>
        <Header title={hosting.namespace.organization.name} />
        <Chat type="hosted" />
      </div>
    </HostingProvider>
  );
}
