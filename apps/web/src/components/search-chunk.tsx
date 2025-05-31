import type { QueryVectorStoreResult } from "@/lib/vector-store/parse";
import { useState } from "react";

import { CodeBlock } from "./chat/code-block";
import { Button } from "./ui/button";

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

const SearchChunk = ({
  chunk,
  index,
  originalIndex,
}: {
  chunk: QueryVectorStoreResult["results"][number];
  index?: number;
  originalIndex?: number;
}) => {
  return (
    <div className="bg-secondary rounded-md p-4">
      <div className="flex justify-between">
        <div>
          <p className="text-muted-foreground text-xs">Score: {chunk.score}</p>
          {chunk.rerankScore && (
            <p className="text-muted-foreground text-xs">
              Re-rank score: {chunk.rerankScore}
            </p>
          )}
        </div>
        {originalIndex !== undefined && index !== undefined ? (
          <div>
            <p className="text-muted-foreground text-xs">
              Original order: {originalIndex + 1}
            </p>
            <p className="text-muted-foreground text-xs">
              Current order: {index + 1}
            </p>
          </div>
        ) : null}
      </div>
      <p
        className="mt-2 text-sm"
        dangerouslySetInnerHTML={{
          __html: chunk.text.replace(/(\n)/g, "<br />"),
        }}
      />
      {chunk.metadata && <CollapsibleMetadata metadata={chunk.metadata} />}
    </div>
  );
};

export default SearchChunk;
