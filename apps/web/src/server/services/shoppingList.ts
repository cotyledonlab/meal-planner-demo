import { type PrismaClient } from '@prisma/client';
import { convertToNormalizedUnit } from '../../lib/unitConverter';

interface ShoppingListItemData {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  ingredientId?: string;
  category: string;
  checked: boolean;
}

interface ShoppingListOutput {
  id: string;
  planId: string;
  items: ShoppingListItemData[];
  createdAt: Date;
}

export class ShoppingListService {
  constructor(private prisma: PrismaClient) {}

  async buildAndStoreForPlan(planId: string): Promise<string> {
    // Check if shopping list already exists for this plan
    const existing = await this.prisma.shoppingList.findUnique({
      where: { planId },
    });

    if (existing) {
      return existing.id;
    }

    // Fetch the plan with all items and their recipes
    // Retry a few times in case of transient issues (e.g., database replication lag)
    let plan = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!plan && attempts < maxAttempts) {
      try {
        plan = await this.prisma.mealPlan.findUnique({
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
          },
        });

        if (plan) break;
      } catch (error) {
        // Log but continue retrying
        console.error(`Attempt ${attempts + 1} to fetch plan failed:`, error);
      }

      attempts++;
      if (!plan && attempts < maxAttempts) {
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
      }
    }

    if (!plan) {
      throw new Error('Meal plan not found');
    }

    // Aggregate ingredients
    const ingredientMap = new Map<
      string,
      { name: string; quantity: number; unit: string; ingredientId: string }
    >();

    for (const item of plan.items) {
      const { recipe, servings } = item;
      const servingsMultiplier = servings / recipe.servingsDefault;

      for (const recipeIngredient of recipe.ingredients) {
        const { ingredient, quantity, unit } = recipeIngredient;
        const adjustedQuantity = quantity * servingsMultiplier;

        const key = `${ingredient.id}-${unit}`;
        const existing = ingredientMap.get(key);

        if (existing) {
          // Same ingredient and unit, just add quantities
          existing.quantity += adjustedQuantity;
        } else {
          // Try to normalize and combine with other units if possible
          let combined = false;
          for (const [, existingItem] of ingredientMap.entries()) {
            if (existingItem.ingredientId === ingredient.id) {
              // Same ingredient, different unit - try to normalize both and combine
              try {
                const normalizedNew = convertToNormalizedUnit(adjustedQuantity, unit);
                const normalizedExisting = convertToNormalizedUnit(
                  existingItem.quantity,
                  existingItem.unit
                );

                // Check if they normalize to the same unit
                if (normalizedNew.unit === normalizedExisting.unit) {
                  // Update existing item with combined normalized quantity
                  existingItem.quantity = normalizedExisting.quantity + normalizedNew.quantity;
                  existingItem.unit = normalizedNew.unit;
                  // Update the key in the map
                  const oldKey = `${ingredient.id}-${existingItem.unit}`;
                  ingredientMap.delete(oldKey);
                  const newKey = `${ingredient.id}-${normalizedNew.unit}`;
                  ingredientMap.set(newKey, existingItem);
                  combined = true;
                  break;
                }
              } catch {
                // Conversion not possible, will create separate entry
                continue;
              }
            }
          }

          if (!combined) {
            ingredientMap.set(key, {
              name: ingredient.name,
              quantity: adjustedQuantity,
              unit,
              ingredientId: ingredient.id,
            });
          }
        }
      }
    }

    // Create shopping list in database
    const shoppingList = await this.prisma.shoppingList.create({
      data: {
        planId,
        items: {
          create: Array.from(ingredientMap.values()).map((item) => ({
            ingredientId: item.ingredientId,
            name: item.name,
            quantity: Math.round(item.quantity * 10) / 10, // Round to 1 decimal
            unit: item.unit,
          })),
        },
      },
    });

    return shoppingList.id;
  }

  async getForPlan(planId: string): Promise<ShoppingListOutput> {
    const shoppingList = await this.prisma.shoppingList.findUnique({
      where: { planId },
      include: {
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!shoppingList) {
      throw new Error('Shopping list not found');
    }

    return {
      id: shoppingList.id,
      planId: shoppingList.planId,
      items: shoppingList.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        ingredientId: item.ingredientId ?? undefined,
        category: item.ingredient?.category ?? 'other',
        checked: item.checked,
      })),
      createdAt: shoppingList.createdAt,
    };
  }

  async toggleItemChecked(itemId: string): Promise<void> {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Shopping list item not found');
    }

    await this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { checked: !item.checked },
    });
  }

  async updateCategoryChecked(
    shoppingListId: string,
    category: string,
    checked: boolean
  ): Promise<void> {
    await this.prisma.shoppingListItem.updateMany({
      where: {
        shoppingListId,
        ingredient: {
          category,
        },
      },
      data: { checked },
    });
  }
}
