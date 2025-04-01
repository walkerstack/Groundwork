"use client";

import type { Metadata } from "next";
import { useOrganization } from "@/contexts/organization-context";

import ApiKeysList from "./api-keys-list";
import CreateApiKey from "./create-api-key";

export const metadata: Metadata = {
  title: "API Keys",
};

export default function ApiKeysPage() {
  const { activeOrganization, isAdmin } = useOrganization();

  if (!isAdmin) {
    return <div>You are not authorized to view this page</div>;
  }

  return (
    <>
      <div className="mb-10">
        <CreateApiKey orgId={activeOrganization.id} />
      </div>

      <ApiKeysList orgId={activeOrganization.id} />
    </>
  );
}
