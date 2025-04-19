"use client";

import CreateNamespaceDialog from "@/components/app-sidebar/org-switcher/create-namespace-dialog";
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
