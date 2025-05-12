import DashboardPageWrapper from "@/components/dashboard-page-wrapper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRightIcon, CodeIcon } from "lucide-react";

import { IngestModal } from "./ingest-modal";
import JobsPageClient from "./page.client";

export default function DocumentsPage() {
  return (
    <DashboardPageWrapper title="Documents">
      <div className="mb-10 flex gap-2">
        <IngestModal />

        <Button asChild variant="ghost">
          <a
            href="https://docs.agentset.ai/api-reference/endpoint/ingest-jobs/create"
            target="_blank"
          >
            <CodeIcon className="size-4" />
            Ingest via API
          </a>
        </Button>
      </div>

      <JobsPageClient />
    </DashboardPageWrapper>
  );
}
