import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CodeBlock } from "./code-block";

interface CitationModalProps {
  trigger: React.ReactNode;
  source: { text: string; metadata?: Record<string, unknown> };
  sourceIndex: number;
}

export function CitationModal({
  trigger,
  source,
  sourceIndex,
}: CitationModalProps) {
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault(); // prevents Radix from auto-focusing the first focusable
        }}
      >
        <DialogHeader>
          <DialogTitle>Source [{sourceIndex}]</DialogTitle>
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
