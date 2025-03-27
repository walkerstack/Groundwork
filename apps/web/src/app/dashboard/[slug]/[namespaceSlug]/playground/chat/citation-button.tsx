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
  console.log({ props, annotations });
  const idx = props["data-citation"] ? props["data-citation"] - 1 : undefined;
  const sources = annotations?.[0]?.["agentset_sources"] as
    | Array<{ text: string; metadata?: Record<string, unknown> }>
    | undefined;

  if (idx === undefined || !sources || !sources[idx])
    return <span {...props}>{children}</span>;

  const source = sources[idx];

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
