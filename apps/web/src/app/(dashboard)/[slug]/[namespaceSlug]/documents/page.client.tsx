"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { useNamespace } from "@/contexts/namespace-context";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { useTRPC } from "@/trpc/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RefreshCcwIcon } from "lucide-react";

import { columns } from "./columns";

export default function DocumentsPage() {
  const { activeNamespace } = useNamespace();
  const trpc = useTRPC();
  const { cursor, cursorDirection, handleNext, handlePrevious, hasPrevious } =
    useCursorPagination();

  const { isLoading, data, refetch, isFetching } = useQuery(
    trpc.document.all.queryOptions(
      {
        namespaceId: activeNamespace.id,
        cursor,
        cursorDirection,
      },
      { refetchInterval: 15_000, placeholderData: keepPreviousData }, // Refetch every 5 seconds
    ),
  );

  return (
    <>
      <div className="mb-5 flex justify-end">
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
