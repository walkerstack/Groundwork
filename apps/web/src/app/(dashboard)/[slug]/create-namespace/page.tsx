"use client";

import CreateNamespaceDialog from "@/components/create-namespace";
import { useOrganization } from "@/contexts/organization-context";

export default function CreateNamespacePage() {
  const { activeOrganization } = useOrganization();

  return (
    <CreateNamespaceDialog
      organization={activeOrganization}
      open
      setOpen={() => {}}
    />
  );
}
