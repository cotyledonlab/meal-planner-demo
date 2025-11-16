import { describe, it, expect, beforeEach, vi } from 'vitest';
import { type TRPCError } from '@trpc/server';

import { createMockContext, mockPrismaClient } from '~/test/mocks';

vi.mock('~/server/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('~/server/db', () => ({
  db: mockPrismaClient,
}));

const mockGeneratePlan = vi.fn();
const mockBuildAndStoreForPlan = vi.fn();

const planModulePromise = vi.importActual<typeof import('../../services/planGenerator')>(
  '../../services/planGenerator'
);

vi.mock('../../services/planGenerator', async () => {
  const actual = await planModulePromise;
  return {
    ...actual,
    PlanGenerationError: actual.PlanGenerationError,
    PlanGenerator: vi.fn().mockImplementation(() => ({
      generatePlan: mockGeneratePlan,
    })),
  };
});

vi.mock('../../services/shoppingList', () => ({
  ShoppingListService: vi.fn().mockImplementation(() => ({
    buildAndStoreForPlan: mockBuildAndStoreForPlan,
  })),
}));

describe('planRouter.generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePlan.mockReset();
    mockBuildAndStoreForPlan.mockReset();
  });

  it('returns generated plan and builds shopping list', async () => {
    const { planRouter } = await import('./plan');

    const mockPlan = {
      id: 'plan-123',
      userId: 'test-user-id',
      startDate: new Date(),
      days: 3,
      createdAt: new Date(),
    };

    mockGeneratePlan.mockResolvedValue(mockPlan);
    mockBuildAndStoreForPlan.mockResolvedValue('shopping-list-123');

    const ctx = createMockContext();
    const caller = planRouter.createCaller(ctx);

    const result = await caller.generate({
      days: 3,
      mealsPerDay: 2,
      householdSize: 2,
    });

    expect(result).toEqual(mockPlan);
    expect(mockGeneratePlan).toHaveBeenCalledWith({
      userId: 'test-user-id',
      startDate: undefined,
      days: 3,
      mealsPerDay: 2,
      householdSize: 2,
      isVegetarian: undefined,
      isDairyFree: undefined,
      dislikes: undefined,
    });
    expect(mockBuildAndStoreForPlan).toHaveBeenCalledWith(mockPlan.id);
  });

  it('maps known generation errors to BAD_REQUEST', async () => {
    const { planRouter } = await import('./plan');

    const planError = new Error('No matching lunch recipes');
    (planError as Error & { code: string; name: string }).name = 'PlanGenerationError';
    (planError as Error & { code: string; name: string }).code = 'NO_RECIPES_FOR_MEAL_TYPE';

    mockGeneratePlan.mockRejectedValue(planError);

    const ctx = createMockContext();
    const caller = planRouter.createCaller(ctx);

    await expect(
      caller.generate({
        days: 3,
        mealsPerDay: 2,
      })
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: 'No matching lunch recipes',
    } satisfies Partial<TRPCError>);
  });

  it('maps plan limit errors to FORBIDDEN', async () => {
    const { planRouter } = await import('./plan');

    const planError = new Error('Plan limit reached');
    (planError as Error & { code: string; name: string }).name = 'PlanGenerationError';
    (planError as Error & { code: string; name: string }).code = 'PLAN_LIMIT_EXCEEDED';

    mockGeneratePlan.mockRejectedValue(planError);

    const ctx = createMockContext();
    const caller = planRouter.createCaller(ctx);

    await expect(
      caller.generate({
        days: 5,
      })
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'Plan limit reached',
    } satisfies Partial<TRPCError>);
  });
});

describe('planRouter.swapRecipe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildAndStoreForPlan.mockReset();
  });

  it('successfully swaps a recipe with an alternative', async () => {
    const { planRouter } = await import('./plan');

    const planId = 'plan-123';
    const mealPlanItemId = 'item-123';
    const currentRecipeId = 'recipe-old';
    const newRecipeId = 'recipe-new';

    const mockPlan = {
      id: planId,
      userId: 'test-user-id',
      startDate: new Date(),
      days: 3,
      items: [
        {
          id: mealPlanItemId,
          planId,
          dayIndex: 0,
          mealType: 'breakfast',
          recipeId: currentRecipeId,
          servings: 2,
          recipe: {
            id: currentRecipeId,
            title: 'Old Recipe',
            mealTypes: ['breakfast'],
            isVegetarian: false,
            isDairyFree: false,
            ingredients: [],
          },
        },
      ],
      user: {
        id: 'test-user-id',
        preferences: {
          isVegetarian: false,
          isDairyFree: false,
          dislikes: '',
        },
      },
    };

    const alternativeRecipes = [
      {
        id: newRecipeId,
        title: 'New Recipe',
        mealTypes: ['breakfast'],
        isVegetarian: false,
        isDairyFree: false,
        ingredients: [],
      },
    ];

    const updatedPlan = {
      ...mockPlan,
      items: [
        {
          ...mockPlan.items[0],
          recipeId: newRecipeId,
          recipe: alternativeRecipes[0],
        },
      ],
    };

    mockPrismaClient.mealPlan.findUnique
      .mockResolvedValueOnce(mockPlan as never)
      .mockResolvedValueOnce(updatedPlan as never);
    mockPrismaClient.recipe.findMany.mockResolvedValue(alternativeRecipes as never);
    mockPrismaClient.mealPlanItem.update.mockResolvedValue({
      id: mealPlanItemId,
      recipeId: newRecipeId,
    } as never);
    mockBuildAndStoreForPlan.mockResolvedValue('shopping-list-123');

    const ctx = createMockContext();
    const caller = planRouter.createCaller(ctx);

    const result = await caller.swapRecipe({
      planId,
      mealPlanItemId,
    });

    expect(result).toBeDefined();
    expect(mockPrismaClient.mealPlanItem.update).toHaveBeenCalledWith({
      where: { id: mealPlanItemId },
      data: { recipeId: newRecipeId },
    });
    expect(mockBuildAndStoreForPlan).toHaveBeenCalledWith(planId);
  });

  it('throws NOT_FOUND when plan does not exist', async () => {
    const { planRouter } = await import('./plan');

    mockPrismaClient.mealPlan.findUnique.mockResolvedValue(null);

    const ctx = createMockContext();
    const caller = planRouter.createCaller(ctx);

    await expect(
      caller.swapRecipe({
        planId: 'nonexistent-plan',
        mealPlanItemId: 'item-123',
      })
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Meal plan not found',
    } satisfies Partial<TRPCError>);
  });

  it('throws FORBIDDEN when plan belongs to different user', async () => {
    const { planRouter } = await import('./plan');

    const mockPlan = {
      id: 'plan-123',
      userId: 'different-user-id',
      items: [],
      user: { preferences: null },
    };

    mockPrismaClient.mealPlan.findUnique.mockResolvedValue(mockPlan as never);

    const ctx = createMockContext();
    const caller = planRouter.createCaller(ctx);

    await expect(
      caller.swapRecipe({
        planId: 'plan-123',
        mealPlanItemId: 'item-123',
      })
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'Unauthorized to modify this meal plan',
    } satisfies Partial<TRPCError>);
  });

  it('throws NOT_FOUND when no alternative recipes are available', async () => {
    const { planRouter } = await import('./plan');

    const mockPlan = {
      id: 'plan-123',
      userId: 'test-user-id',
      items: [
        {
          id: 'item-123',
          mealType: 'breakfast',
          recipeId: 'recipe-old',
          recipe: {
            id: 'recipe-old',
            ingredients: [],
          },
        },
      ],
      user: {
        id: 'test-user-id',
        preferences: {
          isVegetarian: false,
          isDairyFree: false,
          dislikes: '',
        },
      },
    };

    mockPrismaClient.mealPlan.findUnique.mockResolvedValue(mockPlan as never);
    mockPrismaClient.recipe.findMany.mockResolvedValue([]);

    const ctx = createMockContext();
    const caller = planRouter.createCaller(ctx);

    await expect(
      caller.swapRecipe({
        planId: 'plan-123',
        mealPlanItemId: 'item-123',
      })
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'No alternative recipes found that match your preferences',
    } satisfies Partial<TRPCError>);
  });
});
