"use client";

import { DataTable } from "@/components/data-table";
import { useOrganization } from "@/contexts/organization-context";
import { api } from "@/trpc/react";

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
  const { data, isLoading } = api.apiKey.getApiKeys.useQuery({
    orgId,
  });

  return <DataTable columns={columns} data={data} isLoading={isLoading} />;
}
