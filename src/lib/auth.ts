import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, organization } from "better-auth/plugins";
import { db } from "@/server/db";
import { env } from "../env";
import { resend } from "./resend";
import { getAppUrl } from "./utils";

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
      sendInvitationEmail: async ({ email, organization, id }) => {
        await resend.emails.send({
          from: "Agentset.ai <noreply@agentset.ai>",
          to: email,
          subject: `Invitation to join "${organization.name}" on AgentSet.ai`,
          text: `You are invited to join ${organization.name} on AgentSet.ai. Click here to accept the invitation: ${getAppUrl()}/invitation/${id}`,
          html: `<p>You are invited to join ${organization.name} on AgentSet.ai. Click here to accept the invitation: <a href="${getAppUrl()}/invitation/${id}">here</a></p>`,
        });
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "Agentset.ai <noreply@agentset.ai>",
          to: email,
          subject: "You AgentSet login link",
          html: `<p>Click here to sign in to AgentSet.ai: <a href="${url}">here</a></p>`,
        });
      },
    }),
  ],
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
});
