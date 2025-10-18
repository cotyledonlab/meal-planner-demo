import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { aggregateIngredients, formatQuantity } from '~/lib/unitConverter';
import type { NormalizedUnit } from '~/lib/unitConverter';

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

export const shoppingListRouter = createTRPCRouter({
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
      const ingredientMap = new Map(ingredients.map(ingredient => [ingredient.id, ingredient]));

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
      const storePrices: StorePrice[] = Array.from(pricesByStore.entries())
        .map(([store, totalPrice]) => ({
          store,
          totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimals
        }))
        .sort((a, b) => a.totalPrice - b.totalPrice);

      const cheapestStore = storePrices[0];

      return {
        mealPlanId: input.mealPlanId,
        items: shoppingListItems,
        grouped,
        storePrices,
        cheapestStore,
        totalItems: shoppingListItems.length,
      };
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

      for (const [ingredientId, aggData] of aggregated.entries()) {
        const ingredient = await ctx.db.ingredient.findUnique({
          where: { id: ingredientId },
        });

        if (!ingredient) continue;

        csv += `${ingredient.category},${ingredient.name},${aggData.quantity},${aggData.unit}\n`;
      }

      return { csv };
    }),
});
