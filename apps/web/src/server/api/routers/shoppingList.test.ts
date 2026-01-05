import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the auth module
vi.mock('~/server/auth', () => ({
  auth: vi.fn(),
}));

// Mock the db module
vi.mock('~/server/db', () => ({
  db: {
    mealPlan: {},
    pantryItem: {},
    priceBaseline: {},
    ingredient: {},
  },
}));

describe('shoppingListRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getForMealPlan', () => {
    it('should generate shopping list for a meal plan', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockIngredient = {
        id: 'ing-1',
        name: 'chicken breast',
        category: 'protein',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMealPlan = {
        id: 'plan-1',
        userId: 'test-user-id',
        startDate: new Date(),
        days: 3,
        items: [
          {
            id: 'item-1',
            planId: 'plan-1',
            dayIndex: 0,
            mealType: 'dinner',
            recipeId: 'recipe-1',
            servings: 2,
            recipe: {
              id: 'recipe-1',
              servingsDefault: 4,
              ingredients: [
                {
                  id: 'ri-1',
                  recipeId: 'recipe-1',
                  ingredientId: 'ing-1',
                  quantity: 400,
                  unit: 'g',
                  ingredient: mockIngredient,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPriceBaselines = [
        {
          id: 'pb-1',
          ingredientCategory: 'protein',
          store: 'Aldi',
          pricePerUnit: 0.008,
          unit: 'g',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pb-2',
          ingredientCategory: 'protein',
          store: 'Tesco',
          pricePerUnit: 0.01,
          unit: 'g',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.mealPlan.findUnique.mockResolvedValue(mockMealPlan);
      mockPrismaClient.pantryItem.findMany.mockResolvedValue([]);
      mockPrismaClient.ingredient.findMany.mockResolvedValue([mockIngredient]);
      mockPrismaClient.priceBaseline.findMany.mockResolvedValue(mockPriceBaselines);

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      const result = await caller.getForMealPlan({ mealPlanId: 'plan-1' });

      expect(result.mealPlanId).toBe('plan-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.ingredientName).toBe('chicken breast');
      expect(result.items[0]?.category).toBe('protein');
      // Free users should not receive price comparison data
      expect(result.storePrices).toBeNull();
      expect(result.cheapestStore).toBeNull();
    });

    it('should return store prices only for premium users', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockPremiumContext, mockPrismaClient } = await import('~/test/mocks');

      const mockIngredient = {
        id: 'ing-1',
        name: 'chicken breast',
        category: 'protein',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMealPlan = {
        id: 'plan-1',
        userId: 'test-user-id',
        startDate: new Date(),
        days: 3,
        items: [
          {
            id: 'item-1',
            planId: 'plan-1',
            dayIndex: 0,
            mealType: 'dinner',
            recipeId: 'recipe-1',
            servings: 2,
            recipe: {
              id: 'recipe-1',
              servingsDefault: 4,
              ingredients: [
                {
                  id: 'ri-1',
                  recipeId: 'recipe-1',
                  ingredientId: 'ing-1',
                  quantity: 400,
                  unit: 'g',
                  ingredient: mockIngredient,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPriceBaselines = [
        {
          id: 'pb-1',
          ingredientCategory: 'protein',
          store: 'Aldi',
          pricePerUnit: 0.008,
          unit: 'g',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pb-2',
          ingredientCategory: 'protein',
          store: 'Tesco',
          pricePerUnit: 0.01,
          unit: 'g',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.mealPlan.findUnique.mockResolvedValue(mockMealPlan);
      mockPrismaClient.pantryItem.findMany.mockResolvedValue([]);
      mockPrismaClient.ingredient.findMany.mockResolvedValue([mockIngredient]);
      mockPrismaClient.priceBaseline.findMany.mockResolvedValue(mockPriceBaselines);

      const ctx = createMockPremiumContext();
      const caller = shoppingListRouter.createCaller(ctx);

      const result = await caller.getForMealPlan({ mealPlanId: 'plan-1' });

      expect(result.mealPlanId).toBe('plan-1');
      expect(result.items).toHaveLength(1);
      // Premium users should receive price comparison data
      expect(result.storePrices).toHaveLength(2);
      expect(result.cheapestStore?.store).toBe('Aldi');
    });

    it("should not allow access to another user's meal plan", async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockMealPlan = {
        id: 'plan-1',
        userId: 'other-user-id',
        startDate: new Date(),
        days: 3,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.mealPlan.findUnique.mockResolvedValue(mockMealPlan);

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(caller.getForMealPlan({ mealPlanId: 'plan-1' })).rejects.toThrow(
        'Meal plan not found or access denied'
      );
    });

    it('should require authentication', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(caller.getForMealPlan({ mealPlanId: 'plan-1' })).rejects.toThrow();
    });
  });

  describe('exportCSV', () => {
    it('should export shopping list as CSV', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockIngredient = {
        id: 'ing-1',
        name: 'chicken breast',
        category: 'protein',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMealPlan = {
        id: 'plan-1',
        userId: 'test-user-id',
        startDate: new Date(),
        days: 3,
        items: [
          {
            id: 'item-1',
            planId: 'plan-1',
            dayIndex: 0,
            mealType: 'dinner',
            recipeId: 'recipe-1',
            servings: 2,
            recipe: {
              id: 'recipe-1',
              servingsDefault: 4,
              ingredients: [
                {
                  id: 'ri-1',
                  recipeId: 'recipe-1',
                  ingredientId: 'ing-1',
                  quantity: 400,
                  unit: 'g',
                  ingredient: mockIngredient,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.mealPlan.findUnique.mockResolvedValue(mockMealPlan);
      mockPrismaClient.ingredient.findMany.mockResolvedValue([mockIngredient]);

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      const result = await caller.exportCSV({ mealPlanId: 'plan-1' });

      expect(result.csv).toContain('Category,Ingredient,Quantity,Unit');
      expect(result.csv).toContain('protein,chicken breast');
    });

    it("should not allow export of another user's meal plan", async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockMealPlan = {
        id: 'plan-1',
        userId: 'other-user-id',
        startDate: new Date(),
        days: 3,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.mealPlan.findUnique.mockResolvedValue(mockMealPlan);

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(caller.exportCSV({ mealPlanId: 'plan-1' })).rejects.toThrow(
        'Meal plan not found or access denied'
      );
    });

    it('should require authentication', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(caller.exportCSV({ mealPlanId: 'plan-1' })).rejects.toThrow();
    });
  });

  describe('toggleItemChecked', () => {
    it('should toggle item checked state for owned items', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockShoppingListItem = {
        id: 'item-1',
        shoppingListId: 'list-1',
        name: 'Chicken',
        quantity: 500,
        unit: 'g',
        ingredientId: 'ing-1',
        checked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        shoppingList: {
          id: 'list-1',
          planId: 'plan-1',
          createdAt: new Date(),
          plan: {
            id: 'plan-1',
            userId: 'test-user-id',
            startDate: new Date(),
            days: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      mockPrismaClient.shoppingListItem.findUnique.mockResolvedValue(mockShoppingListItem);
      mockPrismaClient.shoppingListItem.update.mockResolvedValue({
        ...mockShoppingListItem,
        checked: true,
      });

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      const result = await caller.toggleItemChecked({ itemId: 'item-1' });

      expect(result.success).toBe(true);
      expect(mockPrismaClient.shoppingListItem.findUnique).toHaveBeenCalledTimes(2); // Once for auth, once in service
    });

    it("should not allow toggling another user's shopping list items (IDOR prevention)", async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockShoppingListItem = {
        id: 'item-1',
        shoppingListId: 'list-1',
        name: 'Chicken',
        quantity: 500,
        unit: 'g',
        ingredientId: 'ing-1',
        checked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        shoppingList: {
          id: 'list-1',
          planId: 'plan-1',
          createdAt: new Date(),
          plan: {
            id: 'plan-1',
            userId: 'other-user-id', // Different user!
            startDate: new Date(),
            days: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      mockPrismaClient.shoppingListItem.findUnique.mockResolvedValue(mockShoppingListItem);

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(caller.toggleItemChecked({ itemId: 'item-1' })).rejects.toThrow('Unauthorized');
    });

    it('should throw error for non-existent item', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      mockPrismaClient.shoppingListItem.findUnique.mockResolvedValue(null);

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(caller.toggleItemChecked({ itemId: 'non-existent' })).rejects.toThrow(
        'Shopping list item not found'
      );
    });

    it('should require authentication', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(caller.toggleItemChecked({ itemId: 'item-1' })).rejects.toThrow();
    });
  });

  describe('updateCategoryChecked', () => {
    it('should update category checked state for owned shopping list', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockShoppingList = {
        id: 'list-1',
        planId: 'plan-1',
        createdAt: new Date(),
        plan: {
          id: 'plan-1',
          userId: 'test-user-id',
          startDate: new Date(),
          days: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockPrismaClient.shoppingList.findUnique.mockResolvedValue(mockShoppingList);
      mockPrismaClient.shoppingListItem.updateMany.mockResolvedValue({ count: 5 });

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      const result = await caller.updateCategoryChecked({
        shoppingListId: 'list-1',
        category: 'produce',
        checked: true,
      });

      expect(result.success).toBe(true);
    });

    it("should not allow updating another user's shopping list categories (IDOR prevention)", async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockShoppingList = {
        id: 'list-1',
        planId: 'plan-1',
        createdAt: new Date(),
        plan: {
          id: 'plan-1',
          userId: 'other-user-id', // Different user!
          startDate: new Date(),
          days: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockPrismaClient.shoppingList.findUnique.mockResolvedValue(mockShoppingList);

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(
        caller.updateCategoryChecked({
          shoppingListId: 'list-1',
          category: 'produce',
          checked: true,
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('should throw error for non-existent shopping list', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      mockPrismaClient.shoppingList.findUnique.mockResolvedValue(null);

      const ctx = createMockContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(
        caller.updateCategoryChecked({
          shoppingListId: 'non-existent',
          category: 'produce',
          checked: true,
        })
      ).rejects.toThrow('Shopping list not found');
    });

    it('should require authentication', async () => {
      const { shoppingListRouter } = await import('./shoppingList');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = shoppingListRouter.createCaller(ctx);

      await expect(
        caller.updateCategoryChecked({
          shoppingListId: 'list-1',
          category: 'produce',
          checked: true,
        })
      ).rejects.toThrow();
    });
  });
});
