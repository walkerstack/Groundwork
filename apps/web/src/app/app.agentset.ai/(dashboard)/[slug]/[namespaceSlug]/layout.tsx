"use client";

import { notFound, useParams } from "next/navigation";
import { NamespaceProvider } from "@/contexts/namespace-context";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

export default function NamespaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trpc = useTRPC();
  const params = useParams();

  const { isLoading, data } = useQuery(
    trpc.namespace.getNamespaceBySlug.queryOptions({
      orgSlug: params.slug as string,
      slug: params.namespaceSlug as string,
    }),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    notFound();
  }

  return (
    <NamespaceProvider activeNamespace={data}>{children}</NamespaceProvider>
  );
}
