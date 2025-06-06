"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import CopyButton from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";
import { useNamespace } from "@/contexts/namespace-context";
import { prefixId } from "@/lib/api/ids";
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
  const id = prefixId(activeNamespace.id, "ns_");

  return (
    <>
      <div className="flex items-center gap-5">
        <h3 className="text-xl font-bold">{activeNamespace.name}</h3>
        <pre className="bg-muted relative rounded-md px-3 py-2 pr-10 text-sm">
          {id}
          <CopyButton
            className="absolute top-1/2 right-1 -translate-y-1/2"
            textToCopy={id}
          />
        </pre>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
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

      <div className="mt-10 flex flex-col gap-10">
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

        <div>
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

        {activeNamespace.keywordEnabled && (
          <div>
            <h2 className="text-lg font-medium">Keyword And Hybrid Search</h2>
            <Separator className="my-2" />
            <Badge variant="success">Enabled</Badge>
          </div>
        )}

        {/* <div >
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
        </div> */}
      </div>
    </>
  );
}
