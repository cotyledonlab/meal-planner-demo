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
