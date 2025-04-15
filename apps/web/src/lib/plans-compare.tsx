import type { ReactNode } from "react";

import type { PLANS } from "./plans";
import { INFINITY_NUMBER } from "./constants";
import { formatNumber } from "./utils";

export const PLAN_COMPARE_FEATURES: {
  category: string;
  href: string;
  features: {
    text:
      | string
      | ((d: { id: string; plan: (typeof PLANS)[number] }) => ReactNode);
    href?: string;
    check?:
      | boolean
      | {
          default?: boolean;
          free?: boolean;
          pro?: boolean;
        };
  }[];
}[] = [
  {
    category: "Namespaces",
    href: "#",
    features: [
      {
        text: ({ plan }) => (
          <>
            <strong>{formatNumber(plan.limits.namespaces)}</strong> namespaces
          </>
        ),
      },
    ],
  },
  {
    category: "Pages",
    href: "#",
    features: [
      {
        text: ({ plan }) => (
          <>
            <strong>{formatNumber(plan.limits.pages)}</strong> pages
          </>
        ),
      },
    ],
  },
  {
    category: "Search",
    href: "#",
    features: [
      {
        text: ({ plan }) => (
          <>
            <strong>
              {plan.limits.retrievals === INFINITY_NUMBER
                ? "Unlimited"
                : formatNumber(plan.limits.retrievals)}
            </strong>{" "}
            retrievals
          </>
        ),
      },
    ],
  },
  {
    category: "Users",
    href: "#",
    features: [
      {
        text: ({ plan }) => (
          <>
            <strong>{formatNumber(plan.limits.users)}</strong> user
            {plan.limits.users === 1 ? "" : "s"}
          </>
        ),
      },
    ],
  },
  {
    category: "API",
    href: "#",
    features: [
      {
        text: ({ plan }) => (
          <>
            <strong>{formatNumber(plan.limits.api)}</strong> API calls/min
          </>
        ),
      },
    ],
  },
  {
    category: "Support",
    href: "#",
    features: [
      {
        text: ({ id }) => (
          <>
            <strong>
              {
                {
                  free: "Basic support",
                  pro: "Priority support",
                }[id]
              }
            </strong>
          </>
        ),
      },
    ],
  },
];
