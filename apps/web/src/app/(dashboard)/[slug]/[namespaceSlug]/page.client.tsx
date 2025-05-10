"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNamespace } from "@/contexts/namespace-context";
import { formatNumber } from "@/lib/utils";

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
            <pre>
              {JSON.stringify(activeNamespace.vectorStoreConfig, null, 2)}
            </pre>
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
            <pre>
              {JSON.stringify(activeNamespace.embeddingConfig, null, 2)}
            </pre>
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
            <pre>
              {JSON.stringify(activeNamespace.fileStoreConfig, null, 2)}
            </pre>
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
