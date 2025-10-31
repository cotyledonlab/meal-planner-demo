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

type MockPrismaTransaction = {
  mealPlan: { create: ReturnType<typeof vi.fn> };
  mealPlanItem: { createMany: ReturnType<typeof vi.fn> };
};

describe('PlanGenerator', () => {
  const startDate = new Date('2025-01-06T00:00:00.000Z');

  let mockPrisma: {
    user: { findUnique: ReturnType<typeof vi.fn> };
    recipe: { findMany: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };
  let mockCreatePlan: ReturnType<typeof vi.fn>;
  let mockCreateItems: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCreatePlan = vi.fn().mockResolvedValue({
      id: 'plan-1',
      userId: 'user-1',
      startDate,
      days: 3,
      createdAt: startDate,
    });

    mockCreateItems = vi.fn().mockResolvedValue(undefined);

    mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'user-1', role: 'basic' }),
      },
      recipe: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'recipe-keep',
            mealTypes: ['dinner'],
            ingredients: [{ ingredient: { name: 'chicken breast' } }],
          },
          {
            id: 'recipe-skip',
            mealTypes: ['dinner'],
            ingredients: [{ ingredient: { name: 'Mushrooms' } }],
          },
        ]),
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
      mockPrisma.recipe.findMany.mockResolvedValue([
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
      ]);

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
      mockPrisma.recipe.findMany.mockResolvedValue([
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
      ]);

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
      mockPrisma.recipe.findMany.mockResolvedValue([
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
      ]);

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
      mockPrisma.recipe.findMany.mockResolvedValue([
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
      ]);

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
      mockPrisma.recipe.findMany.mockResolvedValue([
        {
          id: 'versatile-recipe',
          title: 'Vegetarian Stir-Fry',
          mealTypes: ['breakfast', 'lunch', 'dinner'],
          ingredients: [{ ingredient: { name: 'vegetables' } }],
        },
      ]);

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
      mockPrisma.recipe.findMany.mockResolvedValue([
        {
          id: 'dinner-only',
          title: 'Heavy Stew',
          mealTypes: ['dinner'],
          ingredients: [{ ingredient: { name: 'beef' } }],
        },
      ]);

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
});
