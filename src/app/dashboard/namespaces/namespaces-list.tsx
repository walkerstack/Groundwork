import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function NamespacesList({ orgId }: { orgId: string }) {
  const { data, isLoading } = api.namespace.getOrgNamespaces.useQuery({
    orgId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
        <NamespaceCardSkeleton />
      </div>
    );
  }

  if (data?.length === 0) {
    return <div>No namespaces found</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.map((namespace) => (
        <Link
          key={namespace.id}
          href={`/dashboard/namespaces/${namespace.slug}`}
          className="flex h-40 w-full flex-col items-center justify-center rounded-md border p-4"
        >
          <h3 className="text-lg font-bold">{namespace.name}</h3>
        </Link>
      ))}
    </div>
  );
}

function NamespaceCardSkeleton() {
  return <Skeleton className="h-40 w-full" />;
}
