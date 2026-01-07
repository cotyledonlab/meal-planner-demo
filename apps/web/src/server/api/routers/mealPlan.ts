import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import type { Recipe, PrismaClient } from '@prisma/client';
import { normalizePlanRecipeTimes } from '~/server/services/planNormalization';

/**
 * Rule-based meal plan generator
 * Filters recipes based on user preferences and creates a balanced plan
 */
async function generateMealPlan(
  ctx: { db: PrismaClient },
  preferences: {
    householdSize: number;
    mealsPerDay: number;
    days: number;
    isVegetarian: boolean;
    isDairyFree: boolean;
    dislikes: string | null;
  }
) {
  const dislikeList = preferences.dislikes
    ? preferences.dislikes.split(',').map((d) => d.trim().toLowerCase())
    : [];

  // Fetch recipes that match dietary preferences
  const allRecipes = await ctx.db.recipe.findMany({
    where: {
      AND: [
        preferences.isVegetarian ? { isVegetarian: true } : {},
        preferences.isDairyFree ? { isDairyFree: true } : {},
      ],
    },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  // Filter out recipes with disliked ingredients
  const filteredRecipes = allRecipes.filter((recipe) => {
    if (dislikeList.length === 0) return true;

    const recipeIngredients = recipe.ingredients.map((ri) => ri.ingredient.name.toLowerCase());

    return !dislikeList.some((dislike) => recipeIngredients.some((ing) => ing.includes(dislike)));
  });

  if (filteredRecipes.length === 0) {
    throw new Error('No recipes match your preferences. Please adjust your settings.');
  }

  // Generate meal plan items
  const selectedRecipes: Array<{
    recipe: Recipe;
    dayIndex: number;
    mealType: string;
  }> = [];

  // Simple round-robin selection to ensure variety
  let recipeIndex = 0;
  for (let day = 0; day < preferences.days; day++) {
    for (let meal = 0; meal < preferences.mealsPerDay; meal++) {
      const recipe = filteredRecipes[recipeIndex % filteredRecipes.length];
      if (!recipe) continue;

      // Determine meal type
      let mealType = 'dinner';
      if (preferences.mealsPerDay === 2) {
        mealType = meal === 0 ? 'lunch' : 'dinner';
      } else if (preferences.mealsPerDay === 3) {
        mealType = meal === 0 ? 'breakfast' : meal === 1 ? 'lunch' : 'dinner';
      }

      selectedRecipes.push({
        recipe,
        dayIndex: day,
        mealType,
      });

      recipeIndex++;
    }
  }

  return selectedRecipes;
}

export const mealPlanRouter = createTRPCRouter({
  // Get current or latest meal plan for user
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const latestPlan = await ctx.db.mealPlan.findFirst({
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

    return normalizePlanRecipeTimes(latestPlan);
  }),

  // Generate a new meal plan
  generate: protectedProcedure
    .input(
      z.object({
        householdSize: z.number().min(1).max(10).optional(),
        mealsPerDay: z.number().min(1).max(3).optional(),
        days: z.number().min(3).max(7).optional(),
        isVegetarian: z.boolean().optional(),
        isDairyFree: z.boolean().optional(),
        dislikes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user preferences or use input
      let preferences = await ctx.db.userPreferences.findUnique({
        where: { userId: ctx.session.user.id },
      });

      // If no preferences exist, create them from input or defaults
      if (!preferences) {
        preferences = await ctx.db.userPreferences.create({
          data: {
            userId: ctx.session.user.id,
            householdSize: input.householdSize ?? 2,
            mealsPerDay: input.mealsPerDay ?? 1,
            days: input.days ?? 7,
            isVegetarian: input.isVegetarian ?? false,
            isDairyFree: input.isDairyFree ?? false,
            dislikes: input.dislikes ?? '',
          },
        });
      } else if (
        input.householdSize !== undefined ||
        input.mealsPerDay !== undefined ||
        input.days !== undefined ||
        input.isVegetarian !== undefined ||
        input.isDairyFree !== undefined ||
        input.dislikes !== undefined
      ) {
        // Update preferences if input provided
        preferences = await ctx.db.userPreferences.update({
          where: { userId: ctx.session.user.id },
          data: {
            ...input,
          },
        });
      }

      // Generate meal plan
      const selectedRecipes = await generateMealPlan(ctx, preferences);

      // Create meal plan in database
      const mealPlan = await ctx.db.mealPlan.create({
        data: {
          userId: ctx.session.user.id,
          startDate: new Date(),
          days: preferences.days,
          items: {
            create: selectedRecipes.map((item) => ({
              dayIndex: item.dayIndex,
              mealType: item.mealType,
              recipeId: item.recipe.id,
              servings: preferences.householdSize,
            })),
          },
        },
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

      return normalizePlanRecipeTimes(mealPlan) ?? mealPlan;
    }),

  // Delete a meal plan
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const plan = await ctx.db.mealPlan.findUnique({
        where: { id: input.id },
      });

      if (!plan || plan.userId !== ctx.session.user.id) {
        throw new Error('Meal plan not found or access denied');
      }

      await ctx.db.mealPlan.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
