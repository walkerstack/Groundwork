import type { QueryVectorStoreResult } from "@/lib/vector-store/parse";
import { cn } from "@/lib/utils";

import { CitationModal } from "./citation-modal";

export const CitationButton = ({
  children,
  annotations,
  node: _,
  ...props
}: {
  children?: React.ReactNode;
  annotations?: Array<Record<string, unknown>>;
  "data-citation"?: number;
  node?: any;
  className?: string;
}) => {
  if (!children) return null;

  const idx = props["data-citation"] ? props["data-citation"] - 1 : undefined;
  const sources = annotations?.[0]?.["agentset_sources"] as
    | QueryVectorStoreResult
    | undefined;

  if (idx === undefined || !sources || !sources.results[idx])
    return <span {...props}>{children}</span>;

  const source = sources.results[idx];

  return (
    <CitationModal
      source={source}
      sourceIndex={idx + 1}
      trigger={
        <button
          className={cn(
            props.className,
            "cursor-pointer text-blue-500 hover:underline",
          )}
          {...props}
        >
          <span className="mx-[1.5px]">{children}</span>
        </button>
      }
    />
  );
};
