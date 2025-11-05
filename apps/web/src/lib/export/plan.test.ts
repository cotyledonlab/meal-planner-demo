import { describe, expect, it } from 'vitest';
import {
  createPlanFilename,
  groupPlanByDay,
  normalizeMealPlanForExport,
  summarizeInstructions,
} from './plan';

const samplePlan = {
  id: 'plan_1',
  startDate: '2025-11-04T00:00:00.000Z',
  days: 3,
  items: [
    {
      id: 'item-1',
      dayIndex: 0,
      mealType: 'breakfast',
      servings: 2,
      recipe: {
        id: 'recipe-1',
        title: 'Oatmeal Bowl',
        minutes: 15,
        calories: 320,
        instructionsMd: '1. Boil water.\n2. Add oats.\n3. Stir in toppings.',
        isVegetarian: true,
        isDairyFree: true,
        servingsDefault: 2,
        ingredients: [
          {
            id: 'ing-1',
            quantity: 1,
            unit: 'cup',
            ingredient: {
              id: 'ingredient-1',
              name: 'Rolled Oats',
              category: 'grains',
            },
          },
        ],
      },
    },
    {
      id: 'item-2',
      dayIndex: 1,
      mealType: 'dinner',
      servings: 4,
      recipe: {
        id: 'recipe-2',
        title: 'Veggie Pasta',
        minutes: 30,
        calories: 540,
        instructionsMd: 'Step 1\nStep 2\nStep 3\nStep 4\nStep 5\nStep 6\nStep 7',
        isVegetarian: true,
        isDairyFree: false,
        servingsDefault: 4,
        ingredients: [
          {
            id: 'ing-2',
            quantity: 500,
            unit: 'g',
            ingredient: {
              id: 'ingredient-2',
              name: 'Pasta',
              category: 'grains',
            },
          },
        ],
      },
    },
  ],
};

describe('plan export utilities', () => {
  it('normalises plan data for export', () => {
    const result = normalizeMealPlanForExport(samplePlan);
    expect(result.startDate).toBeInstanceOf(Date);
    const firstIngredient = result.items[0]?.recipe.ingredients[0];
    expect(firstIngredient).toBeDefined();
    expect(firstIngredient!.name).toBe('Rolled Oats');
    expect(firstIngredient!.unit).toBe('cup');
  });

  it('groups items by day and preserves ordering', () => {
    const plan = normalizeMealPlanForExport(samplePlan);
    const days = groupPlanByDay(plan);
    expect(days).toHaveLength(3);
    const firstDay = days[0]!;
    const secondDay = days[1]!;
    expect(firstDay.items[0]!.mealType).toBe('breakfast');
    expect(secondDay.items[0]!.mealType).toBe('dinner');
  });

  it('summarises markdown instructions to the configured limit', () => {
    const steps = summarizeInstructions(samplePlan.items[1]!.recipe.instructionsMd, 5);
    expect(steps).toHaveLength(5);
    expect(steps[0]).toBe('Step 1');
  });

  it('creates predictable filenames for exports', () => {
    const plan = normalizeMealPlanForExport(samplePlan);
    const filename = createPlanFilename('Meal Plan', plan.startDate, plan.days, 'pdf');
    expect(filename).toBe('meal-plan-20251104.pdf');
  });
});
