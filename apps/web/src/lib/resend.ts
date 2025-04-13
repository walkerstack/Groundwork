import type { CreateEmailOptions } from "resend";
import { env } from "@/env";
import { Resend } from "resend";

export const resend = new Resend(env.RESEND_API_KEY);

interface ResendEmailOptions extends Omit<CreateEmailOptions, "to" | "from"> {
  email: string;
  from?: string;
  variant?: "primary" | "notifications" | "marketing";
}

const VARIANT_TO_FROM_MAP = {
  primary: "Agentset.ai <system@agentset.ai>",
  notifications: "Agentset.ai <notifications@mail.agentset.ai>",
  marketing: "Abdellatif from Agentset.ai <abdellatif@ship.agentset.ai>",
};

export const sendEmail = async (opts: ResendEmailOptions) => {
  const {
    email,
    from,
    variant = "primary",
    bcc,
    replyTo,
    subject,
    text,
    react,
    scheduledAt,
  } = opts;

  return await resend.emails.send({
    to: email,
    from: from || VARIANT_TO_FROM_MAP[variant],
    bcc: bcc,
    replyTo: replyTo || "support@agentset.ai",
    subject,
    text,
    react,
    scheduledAt,
    ...(variant === "marketing" && {
      headers: {
        "List-Unsubscribe": "https://app.agentset.ai/account/settings",
      },
    }),
  });
};
