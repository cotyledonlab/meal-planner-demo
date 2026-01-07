import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const preferencesRouter = createTRPCRouter({
  // Get user preferences
  get: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await ctx.db.userPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });

    // Return default preferences if none exist
    if (!preferences) {
      return {
        householdSize: 2,
        mealsPerDay: 1,
        days: 7,
        isVegetarian: false,
        isDairyFree: false,
        dislikes: '',
        weeknightMaxTimeMinutes: null,
        weeklyTimeBudgetMinutes: null,
        prioritizeWeeknights: true,
      };
    }

    return preferences;
  }),

  // Update user preferences
  update: protectedProcedure
    .input(
      z.object({
        householdSize: z.number().min(1).max(10),
        mealsPerDay: z.number().min(1).max(3),
        days: z.number().min(3).max(7),
        isVegetarian: z.boolean(),
        isDairyFree: z.boolean(),
        dislikes: z.string().optional(),
        weeknightMaxTimeMinutes: z.number().int().min(0).max(600).optional().nullable(),
        weeklyTimeBudgetMinutes: z.number().int().min(0).max(600).optional().nullable(),
        prioritizeWeeknights: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const preferences = await ctx.db.userPreferences.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          userId: ctx.session.user.id,
          ...input,
        },
        update: input,
      });

      return preferences;
    }),
});
