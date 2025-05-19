"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNamespace } from "@/contexts/namespace-context";
import { formatNumber } from "@/lib/utils";

const SensitiveInfo = ({ info }: { info: unknown }) => {
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <div className="relative min-h-40 overflow-hidden">
        <pre>
          {JSON.stringify(
            {
              type: "sensitive",
              info: "Click to show",
            },
            null,
            2,
          )}
        </pre>

        <div className="absolute inset-0 isolate flex items-center justify-center">
          <div className="absolute inset-0 -z-1 scale-200 bg-white/10 backdrop-blur-sm" />
          <Button onClick={() => setShow(true)}>Show</Button>
        </div>
      </div>
    );
  }

  return <pre>{JSON.stringify(info, null, 2)}</pre>;
};

export default function NamespacePage() {
  const { activeNamespace } = useNamespace();

  return (
    <>
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
        <div>
          <h2 className="text-lg font-medium">Vector Store</h2>
          <Separator className="my-2" />

          {activeNamespace.vectorStoreConfig ? (
            <SensitiveInfo info={activeNamespace.vectorStoreConfig} />
          ) : (
            <p className="text-muted-foreground">
              No vector store configured for this namespace. Using default
              vector store.
            </p>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium">Embedding</h2>
          <Separator className="my-2" />
          {activeNamespace.embeddingConfig ? (
            <SensitiveInfo info={activeNamespace.embeddingConfig} />
          ) : (
            <p className="text-muted-foreground">
              No embedding configured for this namespace. Using default
              embedding.
            </p>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium">File Store</h2>
          <Separator className="my-2" />
          {activeNamespace.fileStoreConfig ? (
            <SensitiveInfo info={activeNamespace.fileStoreConfig} />
          ) : (
            <p className="text-muted-foreground">
              No file store configured for this namespace. Using default file
              store.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
