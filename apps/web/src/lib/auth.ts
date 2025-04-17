import { cache } from "react";
import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, organization } from "better-auth/plugins";

import { db } from "@agentset/db";
import { InviteUserEmail, LoginEmail } from "@agentset/emails";

import { env } from "../env";
import { sendEmail } from "./resend";
import { getBaseUrl } from "./utils";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    organization({
      sendInvitationEmail: async ({ email, organization, id, inviter }) => {
        const url = `${getBaseUrl()}/invitation/${id}`;
        await sendEmail({
          email,
          subject: "You've been invited to join an organization on Agentset.ai",
          react: InviteUserEmail({
            email,
            url,
            organizationName: organization.name,
            organizationUserEmail: inviter.user.email,
            organizationUser: inviter.user.name,
          }),
        });
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          email,
          subject: "Your Agentset login link",
          react: LoginEmail({ loginLink: url, email }),
        });
      },
    }),
  ],
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
});

export const getSession = cache(async () => {
  const allHeaders = await headers();
  const session = await auth.api
    .getSession({
      headers: allHeaders,
    })
    .catch(() => null);

  return session;
});
