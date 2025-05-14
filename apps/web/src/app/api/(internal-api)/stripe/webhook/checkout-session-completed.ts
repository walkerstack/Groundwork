import type Stripe from "stripe";
import { limiter } from "@/lib/bottleneck";
import { HOME_DOMAIN } from "@/lib/constants";
import { log } from "@/lib/log";
import { getPlanFromPriceId, planToOrganizationFields } from "@/lib/plans";
import { sendEmail } from "@/lib/resend";
import { stripe } from "@/lib/stripe";

import { db } from "@agentset/db";
import { UpgradeEmail } from "@agentset/emails";

export async function checkoutSessionCompleted(event: Stripe.Event) {
  const checkoutSession = event.data.object as Stripe.Checkout.Session;

  if (checkoutSession.mode === "setup") {
    return;
  }

  if (
    checkoutSession.client_reference_id === null ||
    checkoutSession.customer === null
  ) {
    await log({
      message: "Missing items in Stripe webhook callback",
      type: "errors",
    });
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(
    checkoutSession.subscription as string,
  );
  const priceId = subscription.items.data[0]?.price.id;

  const plan = getPlanFromPriceId(priceId);

  if (!plan) {
    await log({
      message: `Invalid price ID in checkout.session.completed event: ${priceId}`,
      type: "errors",
    });
    return;
  }

  const stripeId =
    typeof checkoutSession.customer === "string"
      ? checkoutSession.customer
      : checkoutSession.customer.id;
  const organizationId = checkoutSession.client_reference_id;

  // when the organization subscribes to a plan, set their stripe customer ID
  // in the database for easy identification in future webhook events
  // also update the billingCycleStart to today's date
  const organization = await db.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      stripeId,
      billingCycleStart: new Date().getDate(),
      paymentFailedAt: null,
      ...planToOrganizationFields(plan),
    },
    select: {
      members: {
        select: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        where: {
          role: "owner",
        },
      },
    },
  });

  await Promise.allSettled(
    organization.members.map(({ user }) =>
      limiter.schedule(() =>
        sendEmail({
          email: user.email,
          replyTo: "abdellatif@agentset.ai",
          subject: `Thank you for upgrading to Agentset ${plan.name}!`,
          react: UpgradeEmail({
            name: user.name,
            email: user.email,
            plan,
            domain: HOME_DOMAIN,
          }),
          variant: "marketing",
        }),
      ),
    ),
  );
}
