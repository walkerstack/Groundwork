"use client";

import { cn } from "@/lib/utils";

interface CodeBlockProps {
  node?: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node: _,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  if (!inline) {
    return (
      <div className="not-prose flex flex-col">
        <pre
          {...props}
          className={cn(
            "w-full overflow-x-auto rounded-xl border border-zinc-200 p-4 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50",
            className,
          )}
        >
          <code className="break-words whitespace-pre-wrap">{children}</code>
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
