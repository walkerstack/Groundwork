import type { QueryVectorStoreResult } from "@/lib/vector-store/parse-v2";
import type { Message } from "ai";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogsIcon } from "lucide-react";

import { CodeBlock } from "../code-block";

const CollapsibleMetadata = ({ metadata }: { metadata: unknown }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-border mt-3 border-t pt-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium">Metadata</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide" : "Show"}
        </Button>
      </div>

      {open ? (
        <div className="mt-2">
          <CodeBlock inline={false} className="bg-white">
            {JSON.stringify(metadata, null, 2)}
          </CodeBlock>
        </div>
      ) : null}
    </div>
  );
};

const Chunk = ({
  chunk,
}: {
  chunk: QueryVectorStoreResult["results"][number];
}) => {
  return (
    <div className="bg-secondary rounded-md p-4">
      <p className="text-muted-foreground text-xs">Score: {chunk.score}</p>
      {chunk.rerankScore && (
        <p className="text-muted-foreground text-xs">
          Re-rank score: {chunk.rerankScore}
        </p>
      )}
      <p className="mt-2 text-sm">{chunk.text}</p>
      {chunk.metadata && <CollapsibleMetadata metadata={chunk.metadata} />}
    </div>
  );
};

export default function MessageLogs({ message }: { message: Message }) {
  const sources = (
    message.annotations?.[0] as Record<string, unknown> | undefined
  )?.["agentset_sources"] as QueryVectorStoreResult | undefined;

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="text-muted-foreground h-fit px-2 py-1"
            >
              <LogsIcon className="size-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>

        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Logs</DialogTitle>
            <DialogDescription>
              View the logs for this message.
            </DialogDescription>

            {sources ? (
              <Tabs defaultValue="query">
                <TabsList className="my-3 w-full">
                  <TabsTrigger value="query">Query</TabsTrigger>
                  <TabsTrigger value="chunks">Chunks</TabsTrigger>
                  <TabsTrigger value="re-ranked">Re-ranked</TabsTrigger>
                </TabsList>
                <TabsContent value="query">
                  <CodeBlock>{sources.query}</CodeBlock>
                </TabsContent>
                <TabsContent value="chunks" className="flex flex-col gap-6">
                  {(sources.unorderedResults ?? sources.results).map(
                    (chunk) => (
                      <Chunk key={chunk.id} chunk={chunk} />
                    ),
                  )}
                </TabsContent>
                <TabsContent value="re-ranked" className="flex flex-col gap-6">
                  {sources.unorderedResults ? (
                    sources.results.map((chunk) => (
                      <Chunk key={chunk.id} chunk={chunk} />
                    ))
                  ) : (
                    <p>Re-ranking is disabled.</p>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <p>No logs available</p>
            )}
          </DialogHeader>
        </DialogContent>

        <TooltipContent>Logs</TooltipContent>
      </Tooltip>
    </Dialog>
  );
}
