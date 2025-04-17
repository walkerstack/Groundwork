"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNamespace } from "@/contexts/namespace-context";
import { SparkleIcon } from "lucide-react";

import DashboardPageWrapper from "../dashboard-page-wrapper";

export default function NamespacePage() {
  const { activeNamespace, baseUrl } = useNamespace();

  return (
    <DashboardPageWrapper title={activeNamespace.name}>
      <div>
        <Button asChild>
          <Link href={`${baseUrl}/playground`}>
            <SparkleIcon className="h-4 w-4" />
            Playground
          </Link>
        </Button>
      </div>

      <pre className="bg-muted mt-4 max-w-full min-w-0 rounded-md p-4 text-sm break-words">
        {JSON.stringify(activeNamespace, null, 2)}
      </pre>
    </DashboardPageWrapper>
  );
}
