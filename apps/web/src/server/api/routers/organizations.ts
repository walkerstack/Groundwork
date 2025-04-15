import { createTRPCRouter, protectedProcedure } from "../trpc";

export const organizationsRouter = createTRPCRouter({
  getOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const orgs = await ctx.db.organization.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        invitations: true,
      },
    });

    return orgs;
  }),
});
