import { notFound } from "next/navigation";
import Chat from "@/components/chat";
import { HostingProvider } from "@/contexts/hosting-context";

import { db } from "@agentset/db";

import Header from "./header";

export default async function CustomDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const hosting = await db.hosting.findFirst({
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
