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
});
