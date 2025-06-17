import { prefixId } from "./api/ids";
import { PRO_PLAN_METERED } from "./plans";
import { stripe } from "./stripe";

export const meterIngestedPages = async ({
  documentId,
  totalPages,
  stripeCustomerId,
}: {
  documentId: string;
  totalPages: number;
  stripeCustomerId: string;
}) => {
  await stripe.billing.meterEvents.create({
    identifier: prefixId(documentId, "doc_"), // idempotency key
    event_name: PRO_PLAN_METERED.meterName,
    timestamp: Math.floor(Date.now() / 1000), // send timestamp in seconds
    payload: {
      stripe_customer_id: stripeCustomerId,
      value: totalPages.toFixed(2),
    },
  });
};
