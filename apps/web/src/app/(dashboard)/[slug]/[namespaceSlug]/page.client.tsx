"use client";

import Link from "next/link";
import DashboardPageWrapper from "@/components/dashboard-page-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNamespace } from "@/contexts/namespace-context";
import { cn, formatNumber } from "@/lib/utils";
import { CheckIcon, SparkleIcon } from "lucide-react";

export default function NamespacePage() {
  const { activeNamespace, baseUrl, organization } = useNamespace();

  const steps = [
    {
      name: "Create Namespace",
      description: "Create a namespace to store your documents.",
      status: "complete" as const,
    },
    {
      name: "Ingest Documents",
      description: "Upload documents to the namespace.",
      href: `${baseUrl}/ingest`,
      status: "current" as const,
    },
    {
      name: "Playground",
      description: "Try chatting with your documents in the playground.",
      href: `${baseUrl}/playground`,
      status: "upcoming" as const,
    },
    {
      name: "API Key",
      description: "Create an API key to use the API.",
      href: `/${organization.slug}/settings/api-keys`,
      status: "upcoming" as const,
    },
    {
      name: "API",
      description: "Use the API to interact with your documents.",
      href: "#",
      status: "upcoming" as const,
    },
  ];

  return (
    <DashboardPageWrapper title={activeNamespace.name}>
      {/* <div>
        <Button asChild>
          <Link href={`${baseUrl}/playground`}>
            <SparkleIcon className="h-4 w-4" />
            Playground
          </Link>
        </Button>
      </div>

      <pre className="bg-muted mt-4 max-w-full min-w-0 rounded-md p-4 text-sm break-words">
        {JSON.stringify(activeNamespace, null, 2)}
      </pre> */}

      <div className="grid grid-cols-3 gap-4">
        <Card className="gap-0">
          <CardHeader>
            <CardDescription>Ingestion Jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatNumber(activeNamespace.totalIngestJobs)}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader>
            <CardDescription>Documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatNumber(activeNamespace.totalDocuments)}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader>
            <CardDescription>Pages</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatNumber(activeNamespace.totalPages)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium">Vector Store</h2>
        <Separator className="my-2" />
        {activeNamespace.vectorStoreConfig ? (
          <pre>
            {JSON.stringify(activeNamespace.vectorStoreConfig, null, 2)}
          </pre>
        ) : (
          <p className="text-muted-foreground">
            No vector store configured for this namespace. Using default vector
            store.
          </p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium">Embedding</h2>
        <Separator className="my-2" />
        {activeNamespace.embeddingConfig ? (
          <pre>{JSON.stringify(activeNamespace.embeddingConfig, null, 2)}</pre>
        ) : (
          <p className="text-muted-foreground">
            No embedding configured for this namespace. Using default embedding.
          </p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-medium">File Store</h2>
        <Separator className="my-2" />
        {activeNamespace.fileStoreConfig ? (
          <pre>{JSON.stringify(activeNamespace.fileStoreConfig, null, 2)}</pre>
        ) : (
          <p className="text-muted-foreground">
            No file store configured for this namespace. Using default file
            store.
          </p>
        )}
      </div>

      {/* <div className="flex flex-col items-center pt-20">
        <h1 className="text-foreground text-4xl font-semibold">Get Started</h1>
        <div className="mt-20">
          <NamespaceOnboardingProgress steps={steps} />
        </div>
      </div> */}
    </DashboardPageWrapper>
  );
}

const NamespaceOnboardingProgress = ({
  steps,
}: {
  steps: {
    name: string;
    description?: string;
    href?: string;
    status: "complete" | "current" | "upcoming";
  }[];
}) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => {
          const Tag = step.href ? Link : "div";

          return (
            <li
              key={step.name}
              className={cn(
                stepIdx !== steps.length - 1 && "pb-10",
                "relative",
              )}
            >
              {step.status === "complete" ? (
                <>
                  {stepIdx !== steps.length - 1 ? (
                    <div
                      aria-hidden="true"
                      className="bg-primary absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5"
                    />
                  ) : null}
                  <Tag
                    href={step.href as string}
                    className="group relative flex items-start"
                  >
                    <span className="flex h-9 items-center">
                      <span className="bg-primary group-hover:bg-primary/80 relative z-10 flex size-8 items-center justify-center rounded-full">
                        <CheckIcon
                          aria-hidden="true"
                          className="size-5 text-white"
                        />
                      </span>
                    </span>
                    <span
                      className={cn(
                        "ml-4 flex min-w-0 flex-col",
                        !step.description && "self-center",
                      )}
                    >
                      <span className="text-sm font-medium">{step.name}</span>
                      {step.description && (
                        <span className="text-muted-foreground text-sm">
                          {step.description}
                        </span>
                      )}
                    </span>
                  </Tag>
                </>
              ) : step.status === "current" ? (
                <>
                  {stepIdx !== steps.length - 1 ? (
                    <div
                      aria-hidden="true"
                      className="bg-border absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5"
                    />
                  ) : null}
                  <Tag
                    href={step.href as string}
                    aria-current="step"
                    className="group relative flex items-start"
                  >
                    <span aria-hidden="true" className="flex h-9 items-center">
                      <span className="border-primary bg-background relative z-10 flex size-8 items-center justify-center rounded-full border-2">
                        <span className="bg-primary size-2.5 rounded-full" />
                      </span>
                    </span>
                    <span
                      className={cn(
                        "ml-4 flex min-w-0 flex-col",
                        !step.description && "self-center",
                      )}
                    >
                      <span className="text-primary text-sm font-medium">
                        {step.name}
                      </span>
                      {step.description && (
                        <span className="text-muted-foreground text-sm">
                          {step.description}
                        </span>
                      )}
                    </span>
                  </Tag>
                </>
              ) : (
                <>
                  {stepIdx !== steps.length - 1 ? (
                    <div
                      aria-hidden="true"
                      className="bg-border absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5"
                    />
                  ) : null}
                  <Tag
                    href={step.href as string}
                    className="group relative flex items-start"
                  >
                    <span aria-hidden="true" className="flex h-9 items-center">
                      <span className="border-border relative z-10 flex size-8 items-center justify-center rounded-full border-2 bg-white">
                        <span className="group-hover:bg-border size-2.5 rounded-full bg-transparent" />
                      </span>
                    </span>
                    <span
                      className={cn(
                        "ml-4 flex min-w-0 flex-col",
                        !step.description && "self-center",
                      )}
                    >
                      <span className="text-muted-foreground text-sm font-medium">
                        {step.name}
                      </span>
                      {step.description && (
                        <span className="text-muted-foreground text-sm">
                          {step.description}
                        </span>
                      )}
                    </span>
                  </Tag>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
