import { env } from "@/env";
import Stripe from "stripe";

// You don't need an API Key here, because the app uses the
// dashboard credentials to make requests.
export const stripe = new Stripe(env.STRIPE_API_KEY, {
  apiVersion: "2025-03-31.basil",
  appInfo: {
    name: "Agentset.ai",
    version: "0.1.0",
  },
});
