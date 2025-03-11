import { serve } from "@upstash/workflow/nextjs";
import { Receiver } from "@upstash/qstash";
import { env } from "@/env";

export const { POST } = serve(
  async (context) => {
    await context.run("initial-step", () => {
      console.log("initial step ran");
    });

    await context.run("second-step", () => {
      console.log("second step ran");
    });
  },
  {
    receiver: new Receiver({
      currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
    }),
  },
);
