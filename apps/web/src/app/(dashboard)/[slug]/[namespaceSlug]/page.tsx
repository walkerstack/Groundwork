import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/server";
import { SparkleIcon } from "lucide-react";

import DashboardPageWrapper from "../dashboard-page-wrapper";

export default async function NamespacePage({
  params,
}: {
  params: Promise<{ slug: string; namespaceSlug: string }>;
}) {
  const { slug, namespaceSlug } = await params;
  const namespace = await api.namespace.getNamespaceBySlug({
    slug: namespaceSlug,
    orgSlug: slug,
  });

  if (!namespace) {
    notFound();
  }

  return (
    <DashboardPageWrapper title={namespace.name}>
      <div>
        <Button asChild>
          <Link href={`/${slug}/${namespace.slug}/playground`}>
            <SparkleIcon className="h-4 w-4" />
            Playground
          </Link>
        </Button>
      </div>

      <pre className="bg-muted mt-4 max-w-full min-w-0 rounded-md p-4 text-sm break-words">
        {JSON.stringify(namespace, null, 2)}
      </pre>
    </DashboardPageWrapper>
  );
}
