"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNamespace } from "@/contexts/namespace-context";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { api } from "@/trpc/react";
import { keepPreviousData } from "@tanstack/react-query";
import { RefreshCcwIcon } from "lucide-react";

import { IngestJobStatus } from "@agentset/db";

import { columns } from "./columns";

export default function JobsPage() {
  const { activeNamespace } = useNamespace();
  const [statuses, setStatuses] = useState<IngestJobStatus[]>([]);
  const { cursor, cursorDirection, handleNext, handlePrevious, hasPrevious } =
    useCursorPagination();

  const { isLoading, data, refetch, isFetching } = api.ingestJob.all.useQuery(
    {
      namespaceId: activeNamespace.id,
      statuses,
      cursor,
      cursorDirection,
    },
    { refetchInterval: 15_000, placeholderData: keepPreviousData }, // Refetch every 15 seconds
  );

  return (
    <>
      <div className="mb-5 flex justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Status</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.values(IngestJobStatus).map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statuses.includes(status)}
                onCheckedChange={() =>
                  setStatuses(
                    statuses.includes(status)
                      ? statuses.filter((s) => s !== status)
                      : [...statuses, status],
                  )
                }
                className="capitalize"
              >
                {status.toLowerCase()}
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

      <DataTable columns={columns} data={data?.records} isLoading={isLoading} />

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
