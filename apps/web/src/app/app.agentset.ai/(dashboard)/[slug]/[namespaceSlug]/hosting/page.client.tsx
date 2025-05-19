"use client";

import { Separator } from "@/components/ui/separator";
import { useNamespace } from "@/contexts/namespace-context";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

import { CustomDomainConfigurator } from "./domain-card";
import { EmptyState } from "./empty-state";
import HostingForm from "./form";

export default function HostingPage() {
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.hosting.get.queryOptions({ namespaceId: activeNamespace.id }),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-xl">
      <HostingForm
        isPending={false}
        onSubmit={() => {}}
        defaultValues={{
          protected: data.protected,
          systemPrompt: data.systemPrompt || "",
          examples: data.exampleQuestions,
          welcomeMessage: data.welcomeMessage || "",
        }}
        action="Save"
      />

      <Separator className="my-10" />

      <CustomDomainConfigurator defaultDomain={data.domain?.slug} />
    </div>
  );
}
