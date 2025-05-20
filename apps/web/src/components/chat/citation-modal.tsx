import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useHosting, useIsHosting } from "@/contexts/hosting-context";
import { cn } from "@/lib/utils";

import { CodeBlock } from "./code-block";

interface CitationModalProps {
  source: { text: string; metadata?: Record<string, unknown> };
  sourceIndex: number;
  triggerProps: React.ComponentProps<"button">;
}

const HostingCitation = ({
  source,
  sourceIndex,
}: Pick<CitationModalProps, "source" | "sourceIndex">) => {
  const hosting = useHosting();
  const citationName = useMemo(() => {
    if (!hosting.citationMetadataPath || !source.metadata) return null;

    const path = hosting.citationMetadataPath.split(".");
    let value: unknown = source.metadata;

    for (const key of path) {
      if (value === null || typeof value !== "object") return null;
      value = (value as Record<string, unknown>)[key];
    }

    return typeof value === "string" ? value : null;
  }, [hosting, source.metadata]);

  return <>{citationName || `Source [${sourceIndex}]`}</>;
};

export function CitationModal({
  source,
  sourceIndex,
  triggerProps,
}: CitationModalProps) {
  const isHosting = useIsHosting();

  const stringifiedMetadata = useMemo(() => {
    if (!source.metadata) return null;
    try {
      return JSON.stringify(source.metadata, null, 2);
    } catch {
      return "Failed to parse metadata!";
    }
  }, [source]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            triggerProps.className,
            "cursor-pointer text-blue-500 hover:underline",
          )}
          {...triggerProps}
        >
          <span className="mx-1.5">
            {isHosting ? (
              <HostingCitation source={source} sourceIndex={sourceIndex} />
            ) : (
              triggerProps.children
            )}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault(); // prevents Radix from auto-focusing the first focusable
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isHosting ? (
              <HostingCitation source={source} sourceIndex={sourceIndex} />
            ) : (
              `Source [${sourceIndex}]`
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm whitespace-pre-wrap">{source.text}</p>

          {stringifiedMetadata && (
            <div className="border-border mt-6 border-t pt-6">
              <h3 className="text-xs font-medium">Metadata</h3>
              <div className="mt-2">
                <CodeBlock>{stringifiedMetadata}</CodeBlock>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
