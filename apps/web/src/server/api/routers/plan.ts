import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { PlanGenerator, type PlanGenerationErrorCode } from '../../services/planGenerator';
import { ShoppingListService } from '../../services/shoppingList';
import { createLogger } from '~/lib/logger';

const log = createLogger('plan-router');

const PLAN_ERROR_TO_TRPC_CODE: Record<PlanGenerationErrorCode, TRPCError['code']> = {
  NO_RECIPES_AVAILABLE: 'BAD_REQUEST',
  NO_RECIPES_MATCH_PREFERENCES: 'BAD_REQUEST',
  NO_RECIPES_FOR_MEAL_TYPE: 'BAD_REQUEST',
  PLAN_LIMIT_EXCEEDED: 'FORBIDDEN',
  PLAN_VALIDATION_FAILED: 'INTERNAL_SERVER_ERROR',
  USER_NOT_FOUND: 'UNAUTHORIZED',
};

export const planRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        days: z.number().min(1).max(7).optional(),
        mealsPerDay: z.number().min(1).max(3).optional(),
        householdSize: z.number().min(1).optional(),
        isVegetarian: z.boolean().optional(),
        isDairyFree: z.boolean().optional(),
        dislikes: z.string().optional(),
        // Advanced filters
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().nullable(),
        maxTotalTime: z.number().min(1).optional().nullable(),
        dietTagIds: z.array(z.string()).optional(),
        excludeAllergenNames: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const generator = new PlanGenerator(ctx.db);
        const plan = await generator.generatePlan({
          userId: ctx.session.user.id,
          startDate: input.startDate,
          days: input.days,
          mealsPerDay: input.mealsPerDay,
          householdSize: input.householdSize,
          isVegetarian: input.isVegetarian,
          isDairyFree: input.isDairyFree,
          dislikes: input.dislikes,
          // Advanced filters
          difficulty: input.difficulty ?? undefined,
          maxTotalTime: input.maxTotalTime ?? undefined,
          dietTagIds: input.dietTagIds,
          excludeAllergenNames: input.excludeAllergenNames,
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

        if (error && typeof error === 'object' && 'code' in error) {
          const candidate = error as { code?: unknown; message?: unknown };
          if (typeof candidate.code === 'string') {
            const mappedCode = PLAN_ERROR_TO_TRPC_CODE[candidate.code as PlanGenerationErrorCode];
            if (mappedCode) {
              throw new TRPCError({
                code: mappedCode,
                message:
                  typeof candidate.message === 'string'
                    ? candidate.message
                    : 'Failed to generate meal plan',
                cause: error instanceof Error ? error : undefined,
              });
            }
          }
        }

        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Failed to generate meal plan',
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate meal plan',
          cause: error,
        });
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
                  dietTags: {
                    include: {
                      dietTag: true,
                    },
                  },
                  allergenTags: {
                    include: {
                      allergenTag: true,
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
                dietTags: {
                  include: {
                    dietTag: true,
                  },
                },
                allergenTags: {
                  include: {
                    allergenTag: true,
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

  swapRecipe: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        mealPlanItemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Swap a recipe in a meal plan with an alternative that matches dietary preferences
      const { planId, mealPlanItemId } = input;

      // Fetch the meal plan with all items to verify ownership and get preferences
      const plan = await ctx.db.mealPlan.findUnique({
        where: { id: planId },
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
          },
          user: {
            include: {
              preferences: true,
            },
          },
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meal plan not found',
        });
      }

      // Verify the plan belongs to the user
      if (plan.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized to modify this meal plan',
        });
      }

      // Find the specific meal plan item to swap
      const itemToSwap = plan.items.find((item) => item.id === mealPlanItemId);
      if (!itemToSwap) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meal plan item not found',
        });
      }

      // Get user preferences for dietary constraints
      const preferences = plan.user.preferences;
      const isVegetarian = preferences?.isVegetarian ?? false;
      const isDairyFree = preferences?.isDairyFree ?? false;
      const dislikes = preferences?.dislikes ?? '';

      // Parse dislikes
      const dislikeTerms = dislikes
        ? dislikes
            .toLowerCase()
            .split(',')
            .map((term) => term.trim())
            .filter((term) => term.length > 0)
        : [];

      // Find alternative recipes that match:
      // 1. Same meal type
      // 2. Dietary preferences
      // 3. Not already in the plan
      // 4. Not disliked
      const mealType = itemToSwap.mealType;

      // Get all recipe IDs currently in the plan to avoid duplicates
      const usedRecipeIds = plan.items.map((item) => item.recipeId);

      const alternativeRecipes = await ctx.db.recipe.findMany({
        where: {
          id: { notIn: usedRecipeIds },
          mealTypes: { has: mealType },
          ...(isVegetarian && { isVegetarian: true }),
          ...(isDairyFree && { isDairyFree: true }),
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
      const eligibleRecipes =
        dislikeTerms.length === 0
          ? alternativeRecipes
          : alternativeRecipes.filter((recipe) => {
              const ingredientNames = recipe.ingredients.map((ri) =>
                ri.ingredient.name.toLowerCase()
              );
              return !dislikeTerms.some((dislike) => {
                const dislikeLower = dislike.toLowerCase();
                return ingredientNames.some((ingredient) => {
                  // Match exact ingredient name or as a whole word in multi-word ingredient
                  if (ingredient === dislikeLower) return true;
                  // Match as whole word in multi-word ingredient name
                  // e.g. dislike "peas" matches "snap peas" but not "chickpeas"
                  return ingredient.split(/\s+/).includes(dislikeLower);
                });
              });
            });

      if (eligibleRecipes.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No alternative recipes found that match your preferences',
        });
      }

      // Pick a random alternative recipe
      const randomIndex = Math.floor(Math.random() * eligibleRecipes.length);
      const newRecipe = eligibleRecipes[randomIndex]!; // Safe because we checked length > 0

      // Update the meal plan item with the new recipe
      await ctx.db.mealPlanItem.update({
        where: { id: mealPlanItemId },
        data: { recipeId: newRecipe.id },
      });

      // Recalculate shopping list
      const shoppingListService = new ShoppingListService(ctx.db);
      try {
        await shoppingListService.buildAndStoreForPlan(planId);
      } catch (error) {
        log.error({ error, planId }, 'Failed to update shopping list after recipe swap');
        // Don't fail the mutation - the swap was successful
      }

      // Return the updated plan
      const updatedPlan = await ctx.db.mealPlan.findUnique({
        where: { id: planId },
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

      return updatedPlan;
    }),

  regenerate: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        // Filter overrides (optional)
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().nullable(),
        maxTotalTime: z.number().min(1).optional().nullable(),
        dietTagIds: z.array(z.string()).optional(),
        excludeAllergenNames: z.array(z.string()).optional(),
        isVegetarian: z.boolean().optional(),
        isDairyFree: z.boolean().optional(),
        dislikes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { planId, ...filterOverrides } = input;

      // Fetch existing plan to get base parameters
      const existingPlan = await ctx.db.mealPlan.findUnique({
        where: { id: planId },
        include: {
          items: true,
          user: {
            include: {
              preferences: true,
            },
          },
        },
      });

      if (!existingPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meal plan not found',
        });
      }

      if (existingPlan.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized to modify this meal plan',
        });
      }

      // Determine meal types from existing items
      const mealTypes = [...new Set(existingPlan.items.map((item) => item.mealType))];
      const mealsPerDay = mealTypes.length;

      // Get user preferences as base, override with input
      const preferences = existingPlan.user.preferences;

      try {
        // Delete existing items
        await ctx.db.mealPlanItem.deleteMany({
          where: { planId },
        });

        // Delete existing shopping list if any
        await ctx.db.shoppingList.deleteMany({
          where: { planId },
        });

        // Generate new plan items using the PlanGenerator
        const generator = new PlanGenerator(ctx.db);
        const newPlan = await generator.generatePlan({
          userId: ctx.session.user.id,
          startDate: existingPlan.startDate,
          days: existingPlan.days,
          mealsPerDay,
          householdSize: existingPlan.items[0]?.servings ?? preferences?.householdSize ?? 2,
          isVegetarian: filterOverrides.isVegetarian ?? preferences?.isVegetarian ?? false,
          isDairyFree: filterOverrides.isDairyFree ?? preferences?.isDairyFree ?? false,
          dislikes: filterOverrides.dislikes ?? preferences?.dislikes ?? null,
          difficulty: filterOverrides.difficulty ?? undefined,
          maxTotalTime: filterOverrides.maxTotalTime ?? undefined,
          dietTagIds: filterOverrides.dietTagIds,
          excludeAllergenNames: filterOverrides.excludeAllergenNames,
        });

        // The generator creates a new plan, but we want to keep the same plan ID
        // Move items from new plan to existing plan
        await ctx.db.mealPlanItem.updateMany({
          where: { planId: newPlan.id },
          data: { planId },
        });

        // Delete the newly created plan shell
        await ctx.db.mealPlan.delete({
          where: { id: newPlan.id },
        });

        // Rebuild shopping list
        const shoppingListService = new ShoppingListService(ctx.db);
        try {
          await shoppingListService.buildAndStoreForPlan(planId);
        } catch (error) {
          log.error({ error, planId }, 'Failed to rebuild shopping list after regeneration');
        }

        // Return the updated plan
        const updatedPlan = await ctx.db.mealPlan.findUnique({
          where: { id: planId },
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
                    dietTags: {
                      include: {
                        dietTag: true,
                      },
                    },
                    allergenTags: {
                      include: {
                        allergenTag: true,
                      },
                    },
                  },
                },
              },
              orderBy: [{ dayIndex: 'asc' }, { mealType: 'asc' }],
            },
          },
        });

        return updatedPlan;
      } catch (error) {
        log.error({ error, planId }, 'Failed to regenerate meal plan');

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to regenerate meal plan',
          cause: error,
        });
      }
    }),
});
