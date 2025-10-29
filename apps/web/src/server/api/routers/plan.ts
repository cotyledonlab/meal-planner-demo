import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { PlanGenerator } from '../../services/planGenerator';
import { ShoppingListService } from '../../services/shoppingList';
import { createLogger } from '~/lib/logger';

const log = createLogger('plan-router');

export const planRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const generator = new PlanGenerator(ctx.db);
        const plan = await generator.generatePlan({
          userId: ctx.session.user.id,
          startDate: input.startDate,
        });

        // Validate plan object before returning
        if (!plan?.id || !plan.userId) {
          log.error({ plan }, 'Invalid plan generated');
          throw new Error('Failed to generate valid meal plan');
        }

        // Automatically create shopping list for the plan
        const shoppingListService = new ShoppingListService(ctx.db);
        try {
          await shoppingListService.buildAndStoreForPlan(plan.id);
        } catch (error) {
          // Log the error but don't fail the mutation - shopping list can be generated later
          log.error({ error, planId: plan.id }, 'Failed to create shopping list for plan');
        }

        return plan;
      } catch (error) {
        log.error({ error, userId: ctx.session.user.id }, 'Failed to generate meal plan');
        throw error;
      }
    }),

  getById: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.db.mealPlan.findUnique({
        where: { id: input.planId },
        include: {
          items: {
            include: {
              recipe: {
                include: {
                  ingredients: {
                    include: {
                      ingredient: true,
                    },
                  },
                },
              },
            },
            orderBy: [{ dayIndex: 'asc' }, { mealType: 'asc' }],
          },
        },
      });

      if (!plan) {
        throw new Error('Meal plan not found');
      }

      // Verify the plan belongs to the user
      if (plan.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      return plan;
    }),

  getLast: protectedProcedure.query(async ({ ctx }) => {
    const plan = await ctx.db.mealPlan.findFirst({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            recipe: {
              include: {
                ingredients: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
          orderBy: [{ dayIndex: 'asc' }, { mealType: 'asc' }],
        },
      },
    });

    return plan;
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const plans = await ctx.db.mealPlan.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return plans;
  }),
});
