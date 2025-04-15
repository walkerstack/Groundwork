import type { Prisma } from "@agentset/db";

import { INFINITY_NUMBER } from "./constants";

export type PlanFeature = {
  id?: string;
  text: string;
  tooltip?: {
    title: string;
    cta: string;
    href: string;
  };
};

export const PLANS = [
  {
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      namespaces: 3,
      pages: 1000,
      retrievals: 10_000,
      users: 1,
      api: 60,
    },
  },
  {
    name: "Pro",
    price: {
      monthly: 49,
      yearly: 490,
      ids: [
        "price_1RE26ODPtsw7PNYQduDp19Gx", // yearly
        "price_1RE26ODPtsw7PNYQlDfyMYjV", // monthly

        "price_1RE25PDPtsw7PNYQXPwhPIAt", // yearly (test),
        "price_1RE25PDPtsw7PNYQQjlEQbPf", // monthly (test),
      ],
    },
    limits: {
      namespaces: 10,
      pages: 10_000,
      retrievals: INFINITY_NUMBER,
      users: 10,
      api: 600,
    },
    featureTitle: "Everything in Free, plus:",
    features: [
      { id: "namespaces", text: "10 namespaces" },
      { id: "pages", text: "10K pages" },
      { id: "retrievals", text: "Infinite retrievals" },
      { id: "users", text: "10 users" },
      { id: "api", text: "600 API calls /min" },
    ] as PlanFeature[],
  },
];

export const FREE_PLAN = PLANS.find((plan) => plan.name === "Free")!;
export const PRO_PLAN = PLANS.find((plan) => plan.name === "Pro")!;

export const SELF_SERVE_PAID_PLANS = PLANS.filter((p) =>
  ["Pro"].includes(p.name),
);

export const FREE_ORGANIZATIONS_LIMIT = 2;

export const getPlanFromPriceId = (priceId?: string) => {
  if (!priceId) return null;
  return PLANS.find((plan) => plan.price.ids?.includes(priceId)) || null;
};

export const getPlanDetails = (plan: string) => {
  return SELF_SERVE_PAID_PLANS.find(
    (p) => p.name.toLowerCase() === plan.toLowerCase(),
  )!;
};

export const getCurrentPlan = (plan: string) => {
  return (
    PLANS.find((p) => p.name.toLowerCase() === plan.toLowerCase()) || FREE_PLAN
  );
};

export const getNextPlan = (plan?: string | null) => {
  if (!plan) return PRO_PLAN;
  return PLANS[
    PLANS.findIndex((p) => p.name.toLowerCase() === plan.toLowerCase()) + 1
  ];
};

export const isDowngradePlan = (currentPlan: string, newPlan: string) => {
  const currentPlanIndex = PLANS.findIndex(
    (p) => p.name.toLowerCase() === currentPlan.toLowerCase(),
  );
  const newPlanIndex = PLANS.findIndex(
    (p) => p.name.toLowerCase() === newPlan.toLowerCase(),
  );
  return currentPlanIndex > newPlanIndex;
};

export const planToOrganizationFields = (plan: (typeof PLANS)[number]) => {
  return {
    plan: plan.name.toLowerCase(),
    pagesLimit: plan.limits.pages,
    searchLimit: plan.limits.retrievals,
    apiRatelimit: plan.limits.api,
    // TODO: add other limits
  } satisfies Prisma.OrganizationUpdateInput;
};
