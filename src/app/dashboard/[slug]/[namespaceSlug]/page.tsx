import { notFound } from "next/navigation";
import DashboardPageWrapper from "../dashboard-page-wrapper";
import { api } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SparkleIcon } from "lucide-react";

export default async function NamespacesPage({
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
          <Link href={`/dashboard/${slug}/${namespace.slug}/playground`}>
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
