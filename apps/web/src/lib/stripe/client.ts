import type { Stripe } from "@stripe/stripe-js";
import { env } from "@/env";
import { loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
  }

  return stripePromise;
};
