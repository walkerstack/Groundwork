import { CitationModal } from "./citation-modal";

export const CitationButton = ({
  children,
  annotations,
  ...props
}: {
  children?: React.ReactNode;
  annotations?: Array<Record<string, unknown>>;
  "data-citation"?: number;
}) => {
  if (!children) return null;
  const idx = props["data-citation"] ? props["data-citation"] - 1 : undefined;
  const sources = annotations?.[0]?.["agentset_sources"] as
    | Array<{ text: string }>
    | undefined;

  if (idx === undefined || !sources || !sources[idx])
    return <span {...props}>{children}</span>;

  const source = sources[idx];

  return (
    <CitationModal
      sourceContent={source.text}
      sourceIndex={idx + 1}
      trigger={
        <span
          className="cursor-pointer px-1 text-blue-500 hover:underline"
          {...props}
        >
          {children}
        </span>
      }
    />
  );
};
