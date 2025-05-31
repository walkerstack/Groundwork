"use client";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNamespace } from "@/contexts/namespace-context";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { CustomDomainConfigurator } from "./domain-card";
import { EmptyState } from "./empty-state";
import HostingForm from "./form";

export default function HostingPage() {
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.hosting.get.queryOptions({ namespaceId: activeNamespace.id }),
  );

  const { mutateAsync: updateHosting, isPending: isUpdating } = useMutation(
    trpc.hosting.update.mutationOptions({
      onSuccess: () => {
        toast.success("Hosting updated");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  if (isLoading) {
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  if (!data) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-xl">
      <HostingForm
        isPending={isUpdating}
        onSubmit={async (data) => {
          await updateHosting({
            namespaceId: activeNamespace.id,
            ...data,
          });
        }}
        defaultValues={{
          protected: data.protected,
          systemPrompt: data.systemPrompt || "",
          examplesQuestions: data.exampleQuestions,
          exampleSearchQueries: data.exampleSearchQueries,
          welcomeMessage: data.welcomeMessage || "",
          citationMetadataPath: data.citationMetadataPath || "",
        }}
        action="Save"
      />

      <Separator className="my-10" />

      <CustomDomainConfigurator defaultDomain={data.domain?.slug} />
    </div>
  );
}
