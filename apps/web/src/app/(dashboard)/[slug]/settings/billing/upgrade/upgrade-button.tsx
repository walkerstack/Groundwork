"use client";

import type { ComponentProps } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/contexts/organization-context";
import { SELF_SERVE_PAID_PLANS } from "@/lib/plans";
import { capitalize } from "@/lib/string-utils";
import { getStripe } from "@/lib/stripe/client";
import { getBaseUrl } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function UpgradePlanButton({
  plan,
  period,
  children,
  ...rest
}: {
  plan: string;
  period: "monthly" | "yearly";
} & Partial<ComponentProps<typeof Button>>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeOrganization } = useOrganization();

  const { mutateAsync, isPending } = api.billing.upgrade.useMutation({
    onSuccess: async (data) => {
      // TODO: log to analytics
      if (data.url) {
        router.push(data.url);
      } else if (data.sessionId) {
        const stripe = await getStripe();
        void stripe?.redirectToCheckout({ sessionId: data.sessionId });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const selectedPlan = (SELF_SERVE_PAID_PLANS.find(
    (p) => p.name.toLowerCase() === plan.toLowerCase(),
  ) ?? SELF_SERVE_PAID_PLANS[0])!;

  const queryString = searchParams.toString();
  const isCurrentPlan =
    activeOrganization.plan === selectedPlan.name.toLowerCase();

  const onClick = async () => {
    await mutateAsync({
      orgId: activeOrganization.id,
      plan: plan as any,
      period,
      baseUrl: `${getBaseUrl()}${pathname}${queryString.length > 0 ? `?${queryString}` : ""}`,
    });
  };

  return (
    <Button
      isLoading={isPending}
      disabled={isCurrentPlan}
      onClick={onClick}
      {...rest}
    >
      {children ||
        (isCurrentPlan
          ? "Your current plan"
          : activeOrganization.plan === "free"
            ? `Get started with ${selectedPlan.name} ${capitalize(period)}`
            : `Switch to ${selectedPlan.name} ${capitalize(period)}`)}
    </Button>
  );
}
