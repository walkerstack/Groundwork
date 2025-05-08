"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNamespace } from "@/contexts/namespace-context";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { prefixId } from "@/lib/api/ids";
import { capitalize } from "@/lib/string-utils";
import { useTRPC } from "@/trpc/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RefreshCcwIcon } from "lucide-react";

import { DocumentStatus, IngestJobStatus } from "@agentset/db";

import type { JobsTableMeta } from "./columns";
import type { DocumentCol } from "./documents-columns";
import { CodeBlock } from "../playground/chat/code-block";
import { columns } from "./columns";
import { documentColumns } from "./documents-columns";

const Documents = ({ expandedJobId }: { expandedJobId: string }) => {
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();
  const [statuses, setStatuses] = useState<DocumentStatus[]>([]);
  const { cursor, cursorDirection, handleNext, handlePrevious, hasPrevious } =
    useCursorPagination();

  const { isLoading, data, refetch, isFetching } = useQuery(
    trpc.document.all.queryOptions(
      {
        namespaceId: activeNamespace.id,
        ingestJobId: expandedJobId,
        statuses,
        cursor,
        cursorDirection,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );

  const statusLabels = useMemo(() => {
    return Object.values(DocumentStatus).map((status) => ({
      label: capitalize(status.split("_").join(" ")),
      value: status,
    }));
  }, []);

  return (
    <div className="mt-5 overflow-x-auto">
      <div className="mb-5 flex justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Status</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {statusLabels.map(({ label, value }) => (
              <DropdownMenuCheckboxItem
                key={value}
                checked={statuses.includes(value)}
                onCheckedChange={() =>
                  setStatuses(
                    statuses.includes(value)
                      ? statuses.filter((s) => s !== value)
                      : [...statuses, value],
                  )
                }
                className="capitalize"
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2"
        >
          <RefreshCcwIcon className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="min-h-[450px] w-full">
        <DataTable
          columns={documentColumns}
          data={data?.records as DocumentCol[]}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-10 flex gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
        >
          Previous Page
        </Button>

        <Button
          variant="outline"
          onClick={() => handleNext({ nextCursor: data?.nextCursor })}
          disabled={!data?.nextCursor}
        >
          Next Page
        </Button>
      </div>
    </div>
  );
};

export default function JobsPage() {
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();
  const [statuses, setStatuses] = useState<IngestJobStatus[]>([]);
  const { cursor, cursorDirection, handleNext, handlePrevious, hasPrevious } =
    useCursorPagination();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const { isLoading, data, refetch, isFetching } = useQuery(
    trpc.ingestJob.all.queryOptions(
      {
        namespaceId: activeNamespace.id,
        statuses,
        cursor,
        cursorDirection,
      },
      { refetchInterval: 15_000, placeholderData: keepPreviousData }, // Refetch every 15 seconds
    ),
  );

  const statusLabels = useMemo(() => {
    return Object.values(IngestJobStatus).map((status) => ({
      label: capitalize(status.split("_").join(" ")),
      value: status,
    }));
  }, []);

  return (
    <>
      <div className="mb-5 flex justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Status</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {statusLabels.map(({ label, value }) => (
              <DropdownMenuCheckboxItem
                key={value}
                checked={statuses.includes(value)}
                onCheckedChange={() =>
                  setStatuses(
                    statuses.includes(value)
                      ? statuses.filter((s) => s !== value)
                      : [...statuses, value],
                  )
                }
                className="capitalize"
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2"
        >
          <RefreshCcwIcon className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.records}
        isLoading={isLoading}
        meta={
          { expandedJobId, onExpand: setExpandedJobId } satisfies JobsTableMeta
        }
      />

      {/* Show documents for the expanded job */}
      {expandedJobId && (
        <Dialog open onOpenChange={() => setExpandedJobId(null)}>
          <DialogContent className="sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>Documents</DialogTitle>
              <DialogDescription>
                Documents for the ingest job{" "}
                {expandedJobId && (
                  <CodeBlock inline>
                    {prefixId(expandedJobId, "job_")}
                  </CodeBlock>
                )}
              </DialogDescription>
            </DialogHeader>

            <Documents expandedJobId={expandedJobId} />
          </DialogContent>
        </Dialog>
      )}

      <div className="mt-10 flex gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious}
        >
          Previous Page
        </Button>

        <Button
          variant="outline"
          onClick={() => handleNext({ nextCursor: data?.nextCursor })}
          disabled={!data?.nextCursor}
        >
          Next Page
        </Button>
      </div>
    </>
  );
}
