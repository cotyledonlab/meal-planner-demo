import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { PlanGenerator } from './planGenerator';

// Test types for type safety
type TestMealPlanItem = {
  dayIndex: number;
  mealType: string;
  recipeId: string;
  servings: number;
};

type TestRecipe = {
  id: string;
  title: string;
  mealTypes: string[];
  ingredients: Array<{ ingredient: { name: string } }>;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  totalTimeMinutes?: number | null;
  minutes?: number | null;
};

type MockPrismaTransaction = {
  mealPlan: { create: ReturnType<typeof vi.fn> };
  mealPlanItem: { createMany: ReturnType<typeof vi.fn> };
};

describe('PlanGenerator', () => {
  const startDate = new Date(2025, 0, 6);

  let mockPrisma: {
    user: { findUnique: ReturnType<typeof vi.fn> };
    userPreferences: { findUnique: ReturnType<typeof vi.fn> };
    recipe: { findMany: ReturnType<typeof vi.fn> };
    mealPlanItem: { findMany: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let mockCreatePlan: ReturnType<typeof vi.fn>;
  let mockCreateItems: ReturnType<typeof vi.fn>;
  let mockFindPlanItems: ReturnType<typeof vi.fn>;
  let currentRecipes: TestRecipe[];

  beforeEach(() => {
    currentRecipes = [
      {
        id: 'recipe-keep',
        title: 'Chicken Dinner',
        mealTypes: ['dinner'],
        ingredients: [{ ingredient: { name: 'chicken breast' } }],
      },
      {
        id: 'recipe-skip',
        title: 'Mushroom Dish',
        mealTypes: ['dinner'],
        ingredients: [{ ingredient: { name: 'Mushrooms' } }],
      },
    ];

    mockCreatePlan = vi.fn().mockResolvedValue({
      id: 'plan-1',
      userId: 'user-1',
      startDate,
      days: 3,
      createdAt: startDate,
    });

    mockCreateItems = vi.fn().mockImplementation(() => {
      // Store created items for validation mock
      return Promise.resolve(undefined);
    });

    // Mock for validation - returns items matching what was created
    mockFindPlanItems = vi.fn().mockImplementation(() => {
      const lastCreateCall = mockCreateItems.mock.calls[mockCreateItems.mock.calls.length - 1];
      if (!lastCreateCall) return Promise.resolve([]);

      const itemsData = lastCreateCall[0]?.data ?? [];
      return Promise.resolve(
        itemsData.map((item: TestMealPlanItem) => {
          const recipe = currentRecipes.find((r) => r.id === item.recipeId);
          return {
            ...item,
            id: `item-${item.dayIndex}-${item.mealType}`,
            planId: 'plan-1',
            recipe: recipe ?? currentRecipes[0],
          };
        })
      );
    });

    mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'user-1', role: 'basic' }),
      },
      userPreferences: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      recipe: {
        findMany: vi.fn().mockImplementation(() => Promise.resolve(currentRecipes)),
      },
      mealPlanItem: {
        findMany: mockFindPlanItems,
      },
      $transaction: vi
        .fn()
        .mockImplementation(async (cb: (tx: MockPrismaTransaction) => Promise<unknown>) =>
          cb({
            mealPlan: { create: mockCreatePlan },
            mealPlanItem: { createMany: mockCreateItems },
          })
        ),
    };
  });

  it('filters out recipes containing disliked ingredients', async () => {
    const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

    const plan = await generator.generatePlan({
      userId: 'user-1',
      startDate,
      days: 3,
      mealsPerDay: 1,
      dislikes: 'mushroom',
    });

    expect(plan.id).toBe('plan-1');
    expect(mockPrisma.recipe.findMany).toHaveBeenCalledTimes(1);
    expect(mockCreatePlan).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        startDate,
        days: 3,
      },
    });

    expect(mockCreateItems).toHaveBeenCalledTimes(1);
    const itemsArg = mockCreateItems.mock.calls[0]?.[0];
    expect(itemsArg?.data).toHaveLength(3);
    expect(new Set(itemsArg.data.map((item: { recipeId: string }) => item.recipeId))).toEqual(
      new Set(['recipe-keep'])
    );
  });

  describe('Meal Type Filtering (#105)', () => {
    it('assigns only breakfast recipes to breakfast slots', async () => {
      currentRecipes = [
        {
          id: 'breakfast-recipe',
          title: 'Eggs & Toast',
          mealTypes: ['breakfast'],
          ingredients: [{ ingredient: { name: 'eggs' } }],
        },
        {
          id: 'lunch-dinner-recipe',
          title: 'Thai Red Curry',
          mealTypes: ['lunch', 'dinner'],
          ingredients: [{ ingredient: { name: 'chicken' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 2,
        mealsPerDay: 3, // breakfast, lunch, dinner
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];
      const breakfastItems = itemsArg.data.filter(
        (item: TestMealPlanItem) => item.mealType === 'breakfast'
      );

      // All breakfast slots should have breakfast recipe
      expect(breakfastItems).toHaveLength(2); // 2 days
      breakfastItems.forEach((item: TestMealPlanItem) => {
        expect(item.recipeId).toBe('breakfast-recipe');
      });
    });

    it('never assigns lunch/dinner-only recipes to breakfast', async () => {
      currentRecipes = [
        {
          id: 'breakfast-only',
          title: 'Egg Fried Rice',
          mealTypes: ['breakfast', 'lunch', 'dinner'],
          ingredients: [{ ingredient: { name: 'eggs' } }],
        },
        {
          id: 'thai-curry',
          title: 'Thai Red Curry',
          mealTypes: ['lunch', 'dinner'],
          ingredients: [{ ingredient: { name: 'curry paste' } }],
        },
        {
          id: 'irish-stew',
          title: 'Irish Beef & Guinness Stew',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beef' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 3,
        mealsPerDay: 3,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];
      const breakfastItems = itemsArg.data.filter(
        (item: TestMealPlanItem) => item.mealType === 'breakfast'
      );

      // NONE of the breakfast items should be Thai Curry or Irish Stew
      breakfastItems.forEach((item: TestMealPlanItem) => {
        expect(item.recipeId).not.toBe('thai-curry');
        expect(item.recipeId).not.toBe('irish-stew');
        expect(item.recipeId).toBe('breakfast-only');
      });
    });

    it('assigns only lunch recipes to lunch slots', async () => {
      currentRecipes = [
        {
          id: 'breakfast-only',
          title: 'Eggs',
          mealTypes: ['breakfast'],
          ingredients: [{ ingredient: { name: 'eggs' } }],
        },
        {
          id: 'lunch-recipe',
          title: 'Sandwich',
          mealTypes: ['lunch'],
          ingredients: [{ ingredient: { name: 'bread' } }],
        },
        {
          id: 'dinner-only',
          title: 'Stew',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beef' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 2,
        mealsPerDay: 3,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];
      const lunchItems = itemsArg.data.filter(
        (item: TestMealPlanItem) => item.mealType === 'lunch'
      );

      lunchItems.forEach((item: TestMealPlanItem) => {
        expect(item.recipeId).toBe('lunch-recipe');
      });
    });

    it('assigns only dinner recipes to dinner slots', async () => {
      currentRecipes = [
        {
          id: 'breakfast-only',
          title: 'Eggs',
          mealTypes: ['breakfast'],
          ingredients: [{ ingredient: { name: 'eggs' } }],
        },
        {
          id: 'lunch-only',
          title: 'Sandwich',
          mealTypes: ['lunch'],
          ingredients: [{ ingredient: { name: 'bread' } }],
        },
        {
          id: 'dinner-recipe',
          title: 'Stew',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beef' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 2,
        mealsPerDay: 3,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];
      const dinnerItems = itemsArg.data.filter(
        (item: TestMealPlanItem) => item.mealType === 'dinner'
      );

      dinnerItems.forEach((item: TestMealPlanItem) => {
        expect(item.recipeId).toBe('dinner-recipe');
      });
    });

    it('allows recipes with multiple meal types to be assigned to any matching slot', async () => {
      currentRecipes = [
        {
          id: 'versatile-recipe',
          title: 'Vegetarian Stir-Fry',
          mealTypes: ['breakfast', 'lunch', 'dinner'],
          ingredients: [{ ingredient: { name: 'vegetables' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 2,
        mealsPerDay: 3,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];

      // Should generate 2 days * 3 meals = 6 items
      expect(itemsArg.data).toHaveLength(6);

      // All should use the versatile recipe
      itemsArg.data.forEach((item: TestMealPlanItem) => {
        expect(item.recipeId).toBe('versatile-recipe');
      });
    });

    it('throws error when no recipes match the meal type', async () => {
      currentRecipes = [
        {
          id: 'dinner-only',
          title: 'Heavy Stew',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beef' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await expect(
        generator.generatePlan({
          userId: 'user-1',
          startDate,
          days: 1,
          mealsPerDay: 3, // Needs breakfast, lunch, dinner
        })
      ).rejects.toThrow('No recipes available for breakfast');
    });
  });

  describe('Day Count Validation', () => {
    it('generates exact number of days requested', async () => {
      currentRecipes = [
        {
          id: 'dinner-recipe',
          title: 'Pasta',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'pasta' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 3,
        mealsPerDay: 1,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];

      // Should have 3 days * 1 meal = 3 items
      expect(itemsArg.data).toHaveLength(3);

      // Check all day indices present
      const dayIndices = itemsArg.data.map((item: TestMealPlanItem) => item.dayIndex);
      expect(dayIndices).toEqual([0, 1, 2]);
    });

    it('generates correct items for multiple meals per day', async () => {
      currentRecipes = [
        {
          id: 'breakfast-recipe',
          title: 'Eggs',
          mealTypes: ['breakfast'],
          ingredients: [{ ingredient: { name: 'eggs' } }],
        },
        {
          id: 'lunch-recipe',
          title: 'Salad',
          mealTypes: ['lunch'],
          ingredients: [{ ingredient: { name: 'lettuce' } }],
        },
        {
          id: 'dinner-recipe',
          title: 'Pasta',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'pasta' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 2,
        mealsPerDay: 3,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];

      // Should have 2 days * 3 meals = 6 items
      expect(itemsArg.data).toHaveLength(6);

      // Each day should have breakfast, lunch, dinner
      const day0Items = itemsArg.data.filter((item: TestMealPlanItem) => item.dayIndex === 0);
      const day1Items = itemsArg.data.filter((item: TestMealPlanItem) => item.dayIndex === 1);

      expect(day0Items).toHaveLength(3);
      expect(day1Items).toHaveLength(3);

      expect(day0Items.map((i: TestMealPlanItem) => i.mealType).sort()).toEqual([
        'breakfast',
        'dinner',
        'lunch',
      ]);
      expect(day1Items.map((i: TestMealPlanItem) => i.mealType).sort()).toEqual([
        'breakfast',
        'dinner',
        'lunch',
      ]);
    });
  });

  describe('Time Preferences', () => {
    it('prioritizes shorter recipes on weeknights', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'premium' });
      mockPrisma.userPreferences.findUnique.mockResolvedValue({
        weeknightMaxTimeMinutes: null,
        weeklyTimeBudgetMinutes: null,
        prioritizeWeeknights: true,
      });
      currentRecipes = [
        {
          id: 'quick-dinner',
          title: 'Quick Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'chicken' } }],
          totalTimeMinutes: 20,
        },
        {
          id: 'medium-dinner',
          title: 'Medium Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'rice' } }],
          totalTimeMinutes: 45,
        },
        {
          id: 'slow-dinner',
          title: 'Slow Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beef' } }],
          totalTimeMinutes: 90,
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 7,
        mealsPerDay: 1,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];
      const itemsByDay = new Map(
        itemsArg?.data.map((item: TestMealPlanItem) => [item.dayIndex, item.recipeId])
      );

      const weeknightRecipeIds = [0, 1, 2, 3, 4].map((dayIndex) => itemsByDay.get(dayIndex));
      const weekendRecipeIds = [5, 6].map((dayIndex) => itemsByDay.get(dayIndex));

      expect(new Set(weeknightRecipeIds)).toEqual(new Set(['quick-dinner']));
      expect(new Set(weekendRecipeIds)).toEqual(new Set(['slow-dinner']));
    });

    it('falls back to shortest recipe when weeknight cap is too strict', async () => {
      mockPrisma.userPreferences.findUnique.mockResolvedValue({
        weeknightMaxTimeMinutes: 10,
        weeklyTimeBudgetMinutes: null,
        prioritizeWeeknights: true,
      });
      currentRecipes = [
        {
          id: 'shortish-dinner',
          title: 'Shortish Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'lentils' } }],
          totalTimeMinutes: 25,
        },
        {
          id: 'long-dinner',
          title: 'Long Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beef' } }],
          totalTimeMinutes: 40,
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 1,
        mealsPerDay: 1,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];
      expect(itemsArg?.data[0]?.recipeId).toBe('shortish-dinner');
    });

    it('prefers shorter recipes overall when weekly budget is set', async () => {
      const weekendStart = new Date(startDate);
      weekendStart.setDate(startDate.getDate() + 5);

      mockPrisma.userPreferences.findUnique.mockResolvedValue({
        weeknightMaxTimeMinutes: null,
        weeklyTimeBudgetMinutes: 120,
        prioritizeWeeknights: true,
      });
      currentRecipes = [
        {
          id: 'quick-weekend',
          title: 'Quick Weekend',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'tofu' } }],
          totalTimeMinutes: 20,
        },
        {
          id: 'slow-weekend',
          title: 'Slow Weekend',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'pork' } }],
          totalTimeMinutes: 80,
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate: weekendStart,
        days: 1,
        mealsPerDay: 1,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];
      expect(itemsArg?.data[0]?.recipeId).toBe('quick-weekend');
    });

    it('allows repeats to stay closer to weekly time budget', async () => {
      mockPrisma.userPreferences.findUnique.mockResolvedValue({
        weeknightMaxTimeMinutes: null,
        weeklyTimeBudgetMinutes: 60,
        prioritizeWeeknights: true,
      });
      currentRecipes = [
        {
          id: 'quick-dinner',
          title: 'Quick Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beans' } }],
          totalTimeMinutes: 20,
        },
        {
          id: 'medium-dinner',
          title: 'Medium Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'chicken' } }],
          totalTimeMinutes: 35,
        },
        {
          id: 'slow-dinner',
          title: 'Slow Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'pork' } }],
          totalTimeMinutes: 45,
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 3,
        mealsPerDay: 1,
      });

      const itemsArg = mockCreateItems.mock.calls[0]?.[0];
      expect(itemsArg?.data.map((item: TestMealPlanItem) => item.recipeId)).toEqual([
        'quick-dinner',
        'quick-dinner',
        'quick-dinner',
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('throws error when database is empty', async () => {
      currentRecipes = [];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await expect(
        generator.generatePlan({
          userId: 'user-1',
          startDate,
          days: 1,
          mealsPerDay: 1,
        })
      ).rejects.toThrow('No recipes available');
    });

    it('throws error when no recipes match dietary preferences', async () => {
      currentRecipes = [
        {
          id: 'meat-recipe',
          title: 'Steak',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beef' } }],
        },
      ];

      // Mock prisma to return empty array for vegetarian filter
      mockPrisma.recipe.findMany.mockResolvedValue([]);

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await expect(
        generator.generatePlan({
          userId: 'user-1',
          startDate,
          days: 1,
          mealsPerDay: 1,
          isVegetarian: true,
        })
      ).rejects.toThrow('No recipes available');
    });

    it('throws error when all recipes filtered by dislikes', async () => {
      currentRecipes = [
        {
          id: 'recipe-1',
          title: 'Chicken Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'chicken' } }],
        },
        {
          id: 'recipe-2',
          title: 'Beef Stew',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beef' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await expect(
        generator.generatePlan({
          userId: 'user-1',
          startDate,
          days: 1,
          mealsPerDay: 1,
          dislikes: 'chicken, beef',
        })
      ).rejects.toThrow('No recipes match your preferences');
    });

    it('handles recipe with empty ingredients array', async () => {
      currentRecipes = [
        {
          id: 'recipe-1',
          title: 'Simple Pasta',
          mealTypes: ['dinner'],
          ingredients: [],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      const plan = await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 1,
        mealsPerDay: 1,
        dislikes: 'mushroom',
      });

      expect(plan.id).toBe('plan-1');
      expect(mockCreateItems).toHaveBeenCalledTimes(1);
    });
  });

  describe('Role-based Day Limits (#104)', () => {
    it('throws error when basic user requests more than 3 days', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'basic' });
      currentRecipes = [
        {
          id: 'recipe-1',
          title: 'Chicken Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'chicken' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await expect(
        generator.generatePlan({
          userId: 'user-1',
          startDate,
          days: 7,
          mealsPerDay: 1,
        })
      ).rejects.toThrow('Your plan is limited to 3 days. Upgrade to premium for longer plans.');
    });

    it('allows basic user to request 3 days', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'basic' });
      currentRecipes = [
        {
          id: 'recipe-1',
          title: 'Chicken Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'chicken' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      const plan = await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 3,
        mealsPerDay: 1,
      });

      expect(plan).toBeDefined();
      expect(mockCreatePlan).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          startDate,
          days: 3,
        },
      });
    });

    it('allows premium user to request 7 days', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'premium' });
      currentRecipes = [
        {
          id: 'recipe-1',
          title: 'Chicken Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'chicken' } }],
        },
      ];
      mockCreatePlan.mockResolvedValue({
        id: 'plan-1',
        userId: 'user-1',
        startDate,
        days: 7,
        createdAt: startDate,
      });

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      const plan = await generator.generatePlan({
        userId: 'user-1',
        startDate,
        days: 7,
        mealsPerDay: 1,
      });

      expect(plan).toBeDefined();
      expect(mockCreatePlan).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          startDate,
          days: 7,
        },
      });
    });

    it('throws error when premium user requests more than 7 days', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'premium' });
      currentRecipes = [
        {
          id: 'recipe-1',
          title: 'Chicken Dinner',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'chicken' } }],
        },
      ];

      const generator = new PlanGenerator(mockPrisma as unknown as PrismaClient);

      await expect(
        generator.generatePlan({
          userId: 'user-1',
          startDate,
          days: 14,
          mealsPerDay: 1,
        })
      ).rejects.toThrow('Your plan is limited to 7 days.');
    });
  });
});
