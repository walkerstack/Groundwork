"use client";

import CopyButton from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: string;
  hasCopy?: boolean;
}

export function CodeBlock({
  inline = false,
  className,
  children,
  hasCopy = true,
  ...props
}: CodeBlockProps) {
  if (!inline) {
    return (
      <div className={cn("not-prose relative flex flex-col")}>
        {hasCopy && (
          <CopyButton
            textToCopy={children}
            className="absolute top-2 right-2"
          />
        )}

        <pre
          {...props}
          className={cn(
            "w-full overflow-x-auto rounded-xl border border-zinc-200 p-4 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50",

            className,
          )}
        >
          <code className="min-w-0 break-words [word-break:break-word] whitespace-pre-wrap">
            {children}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <code
      className={cn(
        "rounded-md bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
