"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CreateNamespaceDialog from "@/components/create-namespace";
import { useOrganization } from "@/contexts/organization-context";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { FoldersIcon, PlusIcon, SearchIcon } from "lucide-react";

import {
  Button,
  DataWrapper,
  EmptyState,
  Input,
  Separator,
  Skeleton,
} from "@agentset/ui";

export default function DashboardPage() {
  const { activeOrganization } = useOrganization();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const trpc = useTRPC();
  const {
    data: namespaces,
    isLoading,
    error,
  } = useQuery(
    trpc.namespace.getOrgNamespaces.queryOptions({
      orgId: activeOrganization.id,
    }),
  );

  const finalNamespaces = useMemo(() => {
    if (!namespaces) return [];
    if (!search) return namespaces;

    return namespaces.filter((namespace) =>
      namespace.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [namespaces, search]);

  const createButton = (
    <Button onClick={() => setOpen(true)}>
      <PlusIcon className="size-4" />
      New Namespace
    </Button>
  );

  return (
    <>
      <CreateNamespaceDialog
        organization={activeOrganization}
        open={open}
        setOpen={setOpen}
      />

      <div className="mb-5 flex gap-3">
        {createButton}

        <div className="*:not-first:mt-2">
          <div className="relative">
            <Input
              id="search"
              className="peer px-9"
              placeholder="Search..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <SearchIcon className="size-4" />
            </div>
          </div>
        </div>
      </div>

      <DataWrapper
        data={finalNamespaces}
        isLoading={isLoading}
        error={error}
        loadingState={
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className="bg-muted h-40 animate-pulse rounded-lg"
              />
            ))}
          </div>
        }
        emptyState={
          <EmptyState
            className="mt-20"
            title="No namespaces"
            description="Create a new namespace to start uploading your data"
            icon={FoldersIcon}
            action={createButton}
          />
        }
      >
        {(namespaces) => (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {namespaces.map((namespace) => (
              <Link
                key={namespace.id}
                href={`/${activeOrganization.slug}/${namespace.slug}`}
                className="border-border hover:bg-muted min-h-30 rounded-md border p-6 transition-colors"
              >
                <p className="font-medium">{namespace.name}</p>
                <div className="text-muted-foreground mt-5 flex flex-wrap items-center gap-2 text-sm">
                  <p>{namespace.totalPages} pages</p>
                  <Separator orientation="vertical" className="!h-4 shrink-0" />
                  <p>{namespace.totalDocuments} documents</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </DataWrapper>
    </>
  );
}
