"use client";

import { useNamespace } from "@/contexts/namespace-context";
import DashboardPageWrapper from "../../dashboard-page-wrapper";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { api } from "@/trpc/react";
import { IngestModal } from "./ingest-modal";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IngestJobStatus } from "@prisma/client";
import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { RefreshCcwIcon } from "lucide-react";

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
    { refetchInterval: 10000, placeholderData: keepPreviousData }, // Refetch every 5 seconds
  );

  return (
    <DashboardPageWrapper title="Ingestion Jobs">
      <div className="mb-10">
        <IngestModal />
      </div>

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
                onCheckedChange={(value) =>
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
    </DashboardPageWrapper>
  );
}
