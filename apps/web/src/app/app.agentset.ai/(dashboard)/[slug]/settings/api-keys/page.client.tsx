"use client";

import { DataTable } from "@/components/data-table";
import { useOrganization } from "@/contexts/organization-context";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

import { columns } from "./columns";
import CreateApiKey from "./create-api-key";

export default function ApiKeysPage() {
  const { activeOrganization, isAdmin } = useOrganization();

  if (!isAdmin) {
    return <div>You are not authorized to view this page</div>;
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <CreateApiKey orgId={activeOrganization.id} />
      </div>

      <ApiKeysList orgId={activeOrganization.id} />
    </>
  );
}

function ApiKeysList({ orgId }: { orgId: string }) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.apiKey.getApiKeys.queryOptions({
      orgId,
    }),
  );

  return <DataTable columns={columns} data={data} isLoading={isLoading} />;
}
