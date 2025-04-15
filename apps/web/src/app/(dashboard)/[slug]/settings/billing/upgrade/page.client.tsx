"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganization } from "@/contexts/organization-context";
import { isDowngradePlan, PRO_PLAN } from "@/lib/plans";
import { PLAN_COMPARE_FEATURES } from "@/lib/plans-compare";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import {
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Folders,
  HeadphonesIcon,
  Plug2,
  Search,
  Users,
} from "lucide-react";

import { UpgradePlanButton } from "./upgrade-button";

type IconComponent = typeof CheckIcon;

const COMPARE_FEATURE_ICONS: Record<
  (typeof PLAN_COMPARE_FEATURES)[number]["category"],
  IconComponent
> = {
  Namespaces: Folders,
  Pages: FileText,
  Search: Search,
  Users: Users,
  API: Plug2,
  Support: HeadphonesIcon,
};

const plans = [PRO_PLAN];

export default function OrganizationBillingUpgradePageClient() {
  const { activeOrganization } = useOrganization();
  const { stripeId, plan: currentPlan } = activeOrganization;

  const [mobilePlanIndex, setMobilePlanIndex] = useState(0);
  const [period, setPeriod] = useState<"monthly" | "yearly">("yearly");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${activeOrganization.slug}/settings/billing`}
          title="Back to billing"
          className="group flex items-center gap-2"
        >
          <ChevronLeft
            className="text-muted-foreground mt-px size-5 transition-transform duration-100 group-hover:-translate-x-0.5"
            strokeWidth={2}
          />
          <h1 className="text-xl font-semibold">Plans</h1>
        </Link>

        <Tabs
          value={period}
          onValueChange={(value) => setPeriod(value as "monthly" | "yearly")}
        >
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6">
        <div className="sticky -top-px z-10">
          <div className="[container-type:inline-size] overflow-x-hidden rounded-b-[12px] from-neutral-200 lg:bg-gradient-to-t lg:p-px">
            <div
              className={cn(
                "grid grid-cols-1 gap-px overflow-hidden rounded-b-[11px] text-sm text-neutral-800 [&_strong]:font-medium",

                // Mobile
                "max-lg:w-[calc(400cqw+3*32px)] max-lg:translate-x-[calc(-1*var(--index)*(100cqw+32px))] max-lg:gap-x-8 max-lg:transition-transform",
              )}
              style={
                {
                  "--index": mobilePlanIndex,
                } as CSSProperties
              }
            >
              {plans.map((plan, idx) => {
                // disable upgrade button if user has a Stripe ID and is on the current plan
                // (if there's no stripe id, they could be on a free trial so they should be able to upgrade)
                const disableCurrentPlan = Boolean(
                  stripeId && plan.name.toLowerCase() === currentPlan,
                );

                // show downgrade button if user has a stripe id and is on the current plan
                const isDowngrade = Boolean(
                  stripeId && isDowngradePlan(currentPlan || "free", plan.name),
                );

                return (
                  <div
                    key={plan.name}
                    className={cn(
                      "relative top-0 flex h-full flex-col gap-6 bg-white p-5",
                      "max-lg:rounded-xl max-lg:border max-lg:border-neutral-200",

                      idx !== mobilePlanIndex && "max-lg:opacity-0",
                    )}
                  >
                    <div>
                      <h3 className="py-1 text-base leading-none font-semibold text-neutral-800">
                        {plan.name}
                      </h3>
                      <div>
                        <div className="relative mt-0.5 flex items-center gap-1">
                          {plan.name === "Enterprise" ? (
                            <span className="text-sm font-medium text-neutral-900">
                              Custom
                            </span>
                          ) : (
                            <>
                              <NumberFlow
                                value={plan.price[period]}
                                className="text-sm font-medium text-neutral-700 tabular-nums"
                                format={{
                                  style: "currency",
                                  currency: "USD",
                                  minimumFractionDigits: 0,
                                }}
                              />
                              <span className="text-sm font-medium text-neutral-400">
                                per {period === "monthly" ? "month" : "year"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="h-full w-fit rounded-lg bg-neutral-100 px-2.5 transition-colors duration-75 hover:bg-neutral-200/80 enabled:active:bg-neutral-200 disabled:opacity-30 lg:hidden"
                        disabled={mobilePlanIndex === 0}
                        onClick={() => setMobilePlanIndex(mobilePlanIndex - 1)}
                      >
                        <ChevronLeft className="size-5 text-neutral-800" />
                      </button>

                      <UpgradePlanButton
                        plan={plan.name.toLowerCase()}
                        period={period}
                        disabled={disableCurrentPlan}
                        variant={isDowngrade ? "secondary" : "default"}
                        className="h-8 shadow-sm"
                      >
                        {disableCurrentPlan
                          ? "Current plan"
                          : isDowngrade
                            ? "Downgrade"
                            : "Upgrade"}
                      </UpgradePlanButton>

                      <button
                        type="button"
                        className="h-full w-fit rounded-lg bg-neutral-100 px-2.5 transition-colors duration-75 hover:bg-neutral-200/80 active:bg-neutral-200 disabled:opacity-30 lg:hidden"
                        disabled={mobilePlanIndex >= plans.length - 1}
                        onClick={() => setMobilePlanIndex(mobilePlanIndex + 1)}
                      >
                        <ChevronRight className="size-5 text-neutral-800" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-8 bg-gradient-to-b from-white" />
        </div>
        <div className="flex flex-col gap-8 pb-12">
          {PLAN_COMPARE_FEATURES.map(({ category, href, features }) => {
            const Icon = COMPARE_FEATURE_ICONS[category];

            return (
              <div
                key={category}
                className="[container-type:inline-size] w-full overflow-x-hidden"
              >
                <a
                  href={href}
                  target="_blank"
                  className="flex items-center gap-2 border-b border-neutral-200 px-5 pt-2 pb-4"
                >
                  {Icon && <Icon className="size-4 text-neutral-600" />}
                  <h3 className="text-base font-medium text-black">
                    {category}
                  </h3>
                  <span className="text-xs text-neutral-500">↗</span>
                </a>
                <table
                  className={cn(
                    "grid grid-cols-1 overflow-hidden text-sm text-neutral-800 [&_strong]:font-medium",

                    // Mobile
                    "max-lg:w-[calc(400cqw+3*32px)] max-lg:translate-x-[calc(-1*var(--index)*(100cqw+32px))] max-lg:gap-x-8 max-lg:transition-transform",
                  )}
                  style={
                    {
                      "--index": mobilePlanIndex,
                    } as CSSProperties
                  }
                >
                  <thead className="sr-only">
                    <tr>
                      {plans.map(({ name }) => (
                        <th key={name}>{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="contents">
                    {features.map(({ check, text, href }, idx) => {
                      const As = href ? "a" : "span";

                      return (
                        <tr key={idx} className="contents bg-white">
                          {plans.map((plan) => {
                            const id = plan.name.toLowerCase() as
                              | "free"
                              | "pro";
                            const isChecked =
                              typeof check === "boolean"
                                ? check
                                : check === undefined ||
                                  (check[id] ?? check.default ?? false);

                            return (
                              <td
                                key={id}
                                className={cn(
                                  "flex items-center gap-2 border-b border-neutral-200 bg-white px-5 py-4",
                                  !isChecked && "text-neutral-300",
                                )}
                              >
                                {isChecked ? (
                                  <CheckIcon className="size-3 text-neutral-500" />
                                ) : (
                                  <span className="w-3">&bull;</span>
                                )}
                                <As
                                  href={href}
                                  target="_blank"
                                  {...(href && {
                                    className:
                                      "underline decoration-dotted underline-offset-2 cursor-help",
                                  })}
                                >
                                  {typeof text === "function"
                                    ? text({
                                        id,
                                        plan,
                                      })
                                    : text}
                                </As>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
