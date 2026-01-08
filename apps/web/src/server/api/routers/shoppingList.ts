import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { aggregateIngredients, formatQuantity } from '~/lib/unitConverter';
import type { NormalizedUnit } from '~/lib/unitConverter';
import { ShoppingListService } from '../../services/shoppingList';
import { estimateBudget, type BudgetEstimateMode } from '~/server/services/budgetEstimator';

interface ShoppingListItem {
  ingredientId: string;
  ingredientName: string;
  category: string;
  quantity: number;
  unit: NormalizedUnit;
  formattedQuantity: string;
}

interface StorePrice {
  store: string;
  totalPrice: number;
}

const budgetEstimateModes: BudgetEstimateMode[] = ['cheap', 'standard', 'premium'];

export const shoppingListRouter = createTRPCRouter({
  // Get stored shopping list for a meal plan
  getForPlan: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify the plan belongs to the user
      const plan = await ctx.db.mealPlan.findUnique({
        where: { id: input.planId },
      });

      if (!plan) {
        throw new Error('Meal plan not found');
      }

      if (plan.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      const service = new ShoppingListService(ctx.db);
      const shoppingList = await service.getForPlan(input.planId);
      const isPremium = ctx.session.user.role === 'premium';

      let budgetEstimate: {
        locked: boolean;
        modes?: BudgetEstimateMode[];
        totals?: { cheap: number; standard: number; premium: number };
        missingItemCount?: number;
        confidence?: 'high' | 'medium' | 'low';
      } = {
        locked: true,
        modes: budgetEstimateModes,
      };

      if (isPremium) {
        const priceBaselines = await ctx.db.priceBaseline.findMany();
        const estimate = estimateBudget(
          shoppingList.items.map((item) => ({
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
          })),
          priceBaselines
        );

        budgetEstimate = {
          locked: false,
          totals: estimate.totals,
          missingItemCount: estimate.missingItemCount,
          confidence: estimate.confidence,
        };
      }

      return {
        ...shoppingList,
        budgetEstimate,
      };
    }),

  // Generate shopping list for a meal plan
  getForMealPlan: protectedProcedure
    .input(z.object({ mealPlanId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership and get meal plan with all recipes
      const mealPlan = await ctx.db.mealPlan.findUnique({
        where: { id: input.mealPlanId },
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
        },
      });

      if (!mealPlan || mealPlan.userId !== ctx.session.user.id) {
        throw new Error('Meal plan not found or access denied');
      }

      // Collect all ingredients from all recipes, scaled by servings
      const allIngredients: Array<{
        ingredientId: string;
        quantity: number;
        unit: string;
      }> = [];

      for (const item of mealPlan.items) {
        const servingMultiplier = item.servings / item.recipe.servingsDefault;

        for (const recipeIng of item.recipe.ingredients) {
          allIngredients.push({
            ingredientId: recipeIng.ingredientId,
            quantity: recipeIng.quantity * servingMultiplier,
            unit: recipeIng.unit,
          });
        }
      }

      // Aggregate ingredients
      const aggregated = aggregateIngredients(allIngredients);

      // Get pantry items to subtract
      const pantryItems = await ctx.db.pantryItem.findMany({
        where: { userId: ctx.session.user.id },
      });

      const pantryMap = new Map(
        pantryItems.map((item) => [
          item.ingredientId,
          { quantity: item.quantity, unit: item.unit as NormalizedUnit },
        ])
      );

      // Build shopping list with ingredient details
      const shoppingListItems: ShoppingListItem[] = [];

      // Batch fetch all ingredients needed for the shopping list
      const ingredientIds = Array.from(aggregated.keys());
      const ingredients = await ctx.db.ingredient.findMany({
        where: { id: { in: ingredientIds } },
      });
      const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));

      for (const [ingredientId, aggData] of aggregated.entries()) {
        const ingredient = ingredientMap.get(ingredientId);
        if (!ingredient) continue;

        // Subtract pantry items
        let finalQuantity = aggData.quantity;
        const pantryItem = pantryMap.get(ingredientId);
        if (pantryItem && pantryItem.unit === aggData.unit) {
          finalQuantity = Math.max(0, aggData.quantity - pantryItem.quantity);
        }

        if (finalQuantity > 0) {
          shoppingListItems.push({
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            category: ingredient.category,
            quantity: finalQuantity,
            unit: aggData.unit,
            formattedQuantity: formatQuantity(finalQuantity, aggData.unit),
          });
        }
      }

      // Group by category
      const grouped = shoppingListItems.reduce(
        (acc, item) => {
          acc[item.category] ??= [];
          acc[item.category]!.push(item);
          return acc;
        },
        {} as Record<string, ShoppingListItem[]>
      );

      const isPremium = ctx.session.user.role === 'premium';
      let storePrices: StorePrice[] | null = null;
      let cheapestStore: StorePrice | null = null;
      let budgetEstimate: {
        locked: boolean;
        modes?: BudgetEstimateMode[];
        totals?: { cheap: number; standard: number; premium: number };
        missingItemCount?: number;
        confidence?: 'high' | 'medium' | 'low';
      } = {
        locked: true,
        modes: budgetEstimateModes,
      };

      if (isPremium) {
        // Calculate price estimates per store
        const priceBaselines = await ctx.db.priceBaseline.findMany();
        const pricesByStore = new Map<string, number>();

        for (const item of shoppingListItems) {
          const categoryBaselines = priceBaselines.filter(
            (pb) => pb.ingredientCategory === item.category
          );

          for (const baseline of categoryBaselines) {
            // Convert to baseline unit for price calculation
            if (baseline.unit !== item.unit) {
              // Skip if units don't match (simplified - could add conversion)
              continue;
            }

            const itemCost = item.quantity * baseline.pricePerUnit;
            const currentTotal = pricesByStore.get(baseline.store) ?? 0;
            pricesByStore.set(baseline.store, currentTotal + itemCost);
          }
        }

        // Convert to array and sort by price
        storePrices = Array.from(pricesByStore.entries())
          .map(([store, totalPrice]) => ({
            store,
            totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimals
          }))
          .sort((a, b) => a.totalPrice - b.totalPrice);

        cheapestStore = storePrices[0] ?? null;

        const estimate = estimateBudget(
          shoppingListItems.map((item) => ({
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
          })),
          priceBaselines
        );

        budgetEstimate = {
          locked: false,
          totals: estimate.totals,
          missingItemCount: estimate.missingItemCount,
          confidence: estimate.confidence,
        };
      }

      return {
        mealPlanId: input.mealPlanId,
        items: shoppingListItems,
        grouped,
        storePrices,
        cheapestStore,
        budgetEstimate,
        totalItems: shoppingListItems.length,
      };
    }),

  // Toggle item checked state
  toggleItemChecked: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership: ShoppingListItem → ShoppingList → MealPlan → userId
      const item = await ctx.db.shoppingListItem.findUnique({
        where: { id: input.itemId },
        include: {
          shoppingList: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!item) {
        throw new Error('Shopping list item not found');
      }

      if (item.shoppingList.plan.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      const service = new ShoppingListService(ctx.db);
      await service.toggleItemChecked(input.itemId);
      return { success: true };
    }),

  // Update all items in a category
  updateCategoryChecked: protectedProcedure
    .input(
      z.object({
        shoppingListId: z.string(),
        category: z.string(),
        checked: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership: ShoppingList → MealPlan → userId
      const shoppingList = await ctx.db.shoppingList.findUnique({
        where: { id: input.shoppingListId },
        include: {
          plan: true,
        },
      });

      if (!shoppingList) {
        throw new Error('Shopping list not found');
      }

      if (shoppingList.plan.userId !== ctx.session.user.id) {
        throw new Error('Unauthorized');
      }

      const service = new ShoppingListService(ctx.db);
      await service.updateCategoryChecked(input.shoppingListId, input.category, input.checked);
      return { success: true };
    }),

  // Export shopping list as CSV
  exportCSV: protectedProcedure
    .input(z.object({ mealPlanId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get shopping list data
      const shoppingList = await ctx.db.mealPlan.findUnique({
        where: { id: input.mealPlanId },
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
        },
      });

      if (!shoppingList || shoppingList.userId !== ctx.session.user.id) {
        throw new Error('Meal plan not found or access denied');
      }

      // Collect and aggregate ingredients
      const allIngredients: Array<{
        ingredientId: string;
        quantity: number;
        unit: string;
      }> = [];

      for (const item of shoppingList.items) {
        const servingMultiplier = item.servings / item.recipe.servingsDefault;

        for (const recipeIng of item.recipe.ingredients) {
          allIngredients.push({
            ingredientId: recipeIng.ingredientId,
            quantity: recipeIng.quantity * servingMultiplier,
            unit: recipeIng.unit,
          });
        }
      }

      const aggregated = aggregateIngredients(allIngredients);

      // Build CSV content
      let csv = 'Category,Ingredient,Quantity,Unit\n';

      // Batch fetch all needed ingredients
      const ingredientIds = Array.from(aggregated.keys());
      const ingredients = await ctx.db.ingredient.findMany({
        where: { id: { in: ingredientIds } },
      });
      const ingredientMap = new Map(ingredients.map((ing) => [ing.id, ing]));

      for (const [ingredientId, aggData] of aggregated.entries()) {
        const ingredient = ingredientMap.get(ingredientId);
        if (!ingredient) continue;
        csv += `${ingredient.category},${ingredient.name},${aggData.quantity},${aggData.unit}\n`;
      }

      return { csv };
    }),
});
