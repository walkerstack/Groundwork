"use client";

import { useNamespace } from "@/contexts/namespace-context";
import DashboardPageWrapper from "../../../dashboard-page-wrapper";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { api } from "@/trpc/react";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { Button } from "@/components/ui/button";
import { keepPreviousData } from "@tanstack/react-query";
import { RefreshCcwIcon } from "lucide-react";

export default function DocumentsPage() {
  const { activeNamespace } = useNamespace();
  const { cursor, cursorDirection, handleNext, handlePrevious, hasPrevious } =
    useCursorPagination();

  const { isLoading, data, refetch, isFetching } = api.document.all.useQuery(
    {
      namespaceId: activeNamespace.id,
      cursor,
      cursorDirection,
    },
    { refetchInterval: 5000, placeholderData: keepPreviousData }, // Refetch every 5 seconds
  );

  return (
    <DashboardPageWrapper title="Documents">
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
    </DashboardPageWrapper>
  );
}
