import type { Components } from "react-markdown";
import { memo } from "react";
import Link from "next/link";
import equal from "fast-deep-equal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CitationButton } from "./citation-button";
import { CodeBlock } from "./code-block";
import remarkCitations from "./remark-citations";

interface MarkdownProps {
  children: string;
  annotations?: Array<Record<string, unknown>>;
}

const components: Partial<Components> = {
  // @ts-expect-error - idk
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
  ol: ({ node: _, children, ...props }) => {
    return (
      <ol className="ml-4 list-outside list-decimal" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node: _, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node: _, children, ...props }) => {
    return (
      <ul className="ml-4 list-outside list-decimal" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node: _, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node: _, children, ...props }) => {
    return (
      // @ts-expect-error - idk
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node: _, children, ...props }) => {
    return (
      <h1 className="mt-6 mb-2 text-3xl font-semibold" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node: _, children, ...props }) => {
    return (
      <h2 className="mt-6 mb-2 text-2xl font-semibold" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node: _, children, ...props }) => {
    return (
      <h3 className="mt-6 mb-2 text-xl font-semibold" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node: _, children, ...props }) => {
    return (
      <h4 className="mt-6 mb-2 text-lg font-semibold" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node: _, children, ...props }) => {
    return (
      <h5 className="mt-6 mb-2 text-base font-semibold" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node: _, children, ...props }) => {
    return (
      <h6 className="mt-6 mb-2 text-sm font-semibold" {...props}>
        {children}
      </h6>
    );
  },
  span: ({ node: _, children, ...props }) => {
    return (
      <span className="cursor-pointer text-blue-500 hover:underline" {...props}>
        {children}
      </span>
    );
  },
};

const remarkPlugins = [remarkGfm, remarkCitations];

const NonMemoizedMarkdown = ({ children, annotations }: MarkdownProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      components={{
        ...components,
        span: (props) => (
          <CitationButton {...props} annotations={annotations} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    equal(prevProps.annotations, nextProps.annotations),
);
