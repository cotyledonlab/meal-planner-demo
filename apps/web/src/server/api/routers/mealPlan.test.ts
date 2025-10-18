import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the auth module
vi.mock('~/server/auth', () => ({
  auth: vi.fn(),
}));

// Mock the db module
vi.mock('~/server/db', () => ({
  db: {
    userPreferences: {},
    recipe: {},
    mealPlan: {},
  },
}));

describe('mealPlanRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrent', () => {
    it('should return the latest meal plan with items', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockMealPlan = {
        id: 'plan-1',
        userId: 'test-user-id',
        startDate: new Date(),
        days: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
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
              title: 'Test Recipe',
              minutes: 30,
              calories: 500,
              isVegetarian: false,
              isDairyFree: true,
              servingsDefault: 4,
              instructionsMd: '# Test',
              imageUrl: null,
              ingredients: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      mockPrismaClient.mealPlan.findFirst.mockResolvedValue(mockMealPlan);

      const ctx = createMockContext();
      const caller = mealPlanRouter.createCaller(ctx);

      const result = await caller.getCurrent();

      expect(result).toEqual(mockMealPlan);
      expect(mockPrismaClient.mealPlan.findFirst).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
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
    });

    it('should return null when no meal plans exist', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      mockPrismaClient.mealPlan.findFirst.mockResolvedValue(null);

      const ctx = createMockContext();
      const caller = mealPlanRouter.createCaller(ctx);

      const result = await caller.getCurrent();

      expect(result).toBeNull();
    });

    it('should require authentication', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = mealPlanRouter.createCaller(ctx);

      await expect(caller.getCurrent()).rejects.toThrow();
    });
  });

  describe('generate', () => {
    it('should generate a meal plan with existing preferences', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockPreferences = {
        id: 'pref-1',
        userId: 'test-user-id',
        householdSize: 2,
        mealsPerDay: 1,
        days: 3,
        isVegetarian: false,
        isDairyFree: false,
        dislikes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Test Recipe 1',
          minutes: 30,
          calories: 500,
          isVegetarian: false,
          isDairyFree: false,
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'recipe-2',
          title: 'Test Recipe 2',
          minutes: 25,
          calories: 450,
          isVegetarian: false,
          isDairyFree: false,
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockMealPlan = {
        id: 'plan-1',
        userId: 'test-user-id',
        startDate: new Date(),
        days: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      };

      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(mockPreferences);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);
      mockPrismaClient.mealPlan.create.mockResolvedValue(mockMealPlan);

      const ctx = createMockContext();
      const caller = mealPlanRouter.createCaller(ctx);

      const result = await caller.generate({});

      expect(result).toEqual(mockMealPlan);
      expect(mockPrismaClient.mealPlan.create).toHaveBeenCalled();
    });

    it('should create preferences if they do not exist', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const input = {
        householdSize: 4,
        mealsPerDay: 2,
        days: 5,
        isVegetarian: true,
        isDairyFree: false,
      };

      const mockPreferences = {
        id: 'pref-1',
        userId: 'test-user-id',
        ...input,
        dislikes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Veggie Recipe',
          minutes: 30,
          calories: 400,
          isVegetarian: true,
          isDairyFree: false,
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(null);
      mockPrismaClient.userPreferences.create.mockResolvedValue(mockPreferences);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);
      mockPrismaClient.mealPlan.create.mockResolvedValue({
        id: 'plan-1',
        userId: 'test-user-id',
        startDate: new Date(),
        days: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      });

      const ctx = createMockContext();
      const caller = mealPlanRouter.createCaller(ctx);

      await caller.generate(input);

      expect(mockPrismaClient.userPreferences.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-id',
          householdSize: 4,
          mealsPerDay: 2,
          days: 5,
          isVegetarian: true,
          isDairyFree: false,
          dislikes: '',
        },
      });
    });

    it('should filter recipes by vegetarian preference', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockPreferences = {
        id: 'pref-1',
        userId: 'test-user-id',
        householdSize: 2,
        mealsPerDay: 1,
        days: 3,
        isVegetarian: true,
        isDairyFree: false,
        dislikes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRecipes = [
        {
          id: 'recipe-1',
          title: 'Veggie Recipe',
          minutes: 30,
          calories: 400,
          isVegetarian: true,
          isDairyFree: false,
          servingsDefault: 4,
          instructionsMd: '# Test',
          imageUrl: null,
          ingredients: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.userPreferences.findUnique.mockResolvedValue(mockPreferences);
      mockPrismaClient.recipe.findMany.mockResolvedValue(mockRecipes);
      mockPrismaClient.mealPlan.create.mockResolvedValue({
        id: 'plan-1',
        userId: 'test-user-id',
        startDate: new Date(),
        days: 3,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const ctx = createMockContext();
      const caller = mealPlanRouter.createCaller(ctx);

      await caller.generate({});

      expect(mockPrismaClient.recipe.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ isVegetarian: true }, {}],
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    });

    it('should require authentication', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = mealPlanRouter.createCaller(ctx);

      await expect(caller.generate({})).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a meal plan', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockMealPlan = {
        id: 'plan-1',
        userId: 'test-user-id',
        startDate: new Date(),
        days: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.mealPlan.findUnique.mockResolvedValue(mockMealPlan);
      mockPrismaClient.mealPlan.delete.mockResolvedValue(mockMealPlan);

      const ctx = createMockContext();
      const caller = mealPlanRouter.createCaller(ctx);

      const result = await caller.delete({ id: 'plan-1' });

      expect(result).toEqual({ success: true });
      expect(mockPrismaClient.mealPlan.delete).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
      });
    });

    it('should not delete a meal plan belonging to another user', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockContext, mockPrismaClient } = await import('~/test/mocks');

      const mockMealPlan = {
        id: 'plan-1',
        userId: 'other-user-id',
        startDate: new Date(),
        days: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.mealPlan.findUnique.mockResolvedValue(mockMealPlan);

      const ctx = createMockContext();
      const caller = mealPlanRouter.createCaller(ctx);

      await expect(caller.delete({ id: 'plan-1' })).rejects.toThrow(
        'Meal plan not found or access denied'
      );
    });

    it('should require authentication', async () => {
      const { mealPlanRouter } = await import('./mealPlan');
      const { createMockPublicContext } = await import('~/test/mocks');

      const ctx = createMockPublicContext();
      const caller = mealPlanRouter.createCaller(ctx);

      await expect(caller.delete({ id: 'plan-1' })).rejects.toThrow();
    });
  });
});
