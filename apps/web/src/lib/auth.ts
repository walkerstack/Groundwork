import { cache } from "react";
import { headers } from "next/headers";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink, organization } from "better-auth/plugins";

import { db } from "@agentset/db";
import { InviteUserEmail, LoginEmail, WelcomeEmail } from "@agentset/emails";

import { env } from "../env";
import { HOME_DOMAIN } from "./constants";
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
    admin(),
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
            organizationUser: inviter.user.name || null,
            domain: HOME_DOMAIN,
          }),
        });
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          email,
          subject: "Your Agentset login link",
          react: LoginEmail({ loginLink: url, email, domain: HOME_DOMAIN }),
        });
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await sendEmail({
            email: user.email,
            subject: "Welcome to Agentset",
            react: WelcomeEmail({
              name: user.name || null,
              email: user.email,
              domain: HOME_DOMAIN,
            }),
            variant: "marketing",
          });
        },
      },
    },
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
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
