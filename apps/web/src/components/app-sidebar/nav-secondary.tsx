"use client";

import Link from "next/link";
import { useOrganization } from "@/contexts/organization-context";
import { INFINITY_NUMBER } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { secondaryItems } from "./links";
import { NavItems } from "./nav-items";

export function NavSecondary() {
  const { activeOrganization } = useOrganization();

  const formatUsage = (usage: number, limit: number) => {
    if (limit >= INFINITY_NUMBER) return "Unlimited";
    return `${usage} of ${formatNumber(limit, "compact")}`;
  };

  return (
    <div className="mt-auto">
      <div className="w-full px-2">
        <div>
          <p className="text-muted-foreground text-sm font-medium">Usage</p>

          <div className="text-foreground mt-6 text-xs font-medium">
            <div className="mb-2 flex justify-between">
              <p>Pages</p>
              <p>
                {formatUsage(
                  activeOrganization.totalPages,
                  activeOrganization.pagesLimit,
                )}
              </p>
            </div>

            <Progress
              value={activeOrganization.totalPages}
              max={activeOrganization.pagesLimit}
              className="h-[2px]"
            />
          </div>

          <div className="text-foreground mt-4 text-xs font-medium">
            <div className="mb-2 flex justify-between">
              <p>Retrievals</p>
              <p>
                {formatUsage(
                  activeOrganization.searchUsage,
                  activeOrganization.searchLimit,
                )}
              </p>
            </div>

            <Progress
              value={activeOrganization.searchUsage}
              max={activeOrganization.searchLimit}
              className="h-[2px]"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={`/${activeOrganization.slug}/settings/billing/upgrade`}>
              Get Pro
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href={`/${activeOrganization.slug}/settings/billing/upgrade`}>
              Schedule a Demo
            </Link>
          </Button>
        </div>
      </div>

      {/* <NavItems items={secondaryItems} /> */}
    </div>
  );
}
