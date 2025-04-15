"use client";

import Link from "next/link";
import { DataWrapper } from "@/components/ui/data-wrapper";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/contexts/organization-context";
import { api } from "@/trpc/react";
import { FolderIcon } from "lucide-react";

import CreateNamespace from "./create-namespace";

export default function NamespacesList() {
  const { activeOrganization } = useOrganization();
  const { data, isLoading, error } = api.namespace.getOrgNamespaces.useQuery({
    orgId: activeOrganization.id,
  });

  return (
    <DataWrapper
      data={data}
      isLoading={isLoading}
      error={error}
      emptyState={
        <EmptyState
          title="No namespaces found"
          description="Create a new namespace to get started"
          icon={FolderIcon}
          action={<CreateNamespace />}
          className="min-h-[300px]"
        />
      }
      loadingState={
        <div>
          <Skeleton className="h-9 w-44" />
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Skeleton className="h-40 w-full" key={index} />
            ))}
          </div>
        </div>
      }
    >
      {(namespaces) => (
        <div>
          <CreateNamespace />
          <div className="mt-4 grid grid-cols-3 gap-4">
            {namespaces.map((namespace) => (
              <Link
                key={namespace.id}
                href={`/${activeOrganization.slug}/${namespace.slug}`}
                className="flex h-40 w-full flex-col items-center justify-center rounded-md border p-4"
              >
                <h3 className="text-lg font-bold">{namespace.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </DataWrapper>
  );
}
