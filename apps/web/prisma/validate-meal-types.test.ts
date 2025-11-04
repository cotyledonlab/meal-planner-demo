import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  evaluateMealTypes,
  fixCorruptedMealTypes,
  validateMealTypes,
  type ValidationResult,
} from './validate-meal-types';

describe('evaluateMealTypes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('classifies recipes with empty, missing, or invalid meal types', () => {
    const { valid, invalid } = evaluateMealTypes([
      {
        id: 'missing',
        title: 'Missing Types',
        mealTypes: null,
      },
      {
        id: 'empty',
        title: 'Empty Types',
        mealTypes: [],
      },
      {
        id: 'invalid',
        title: 'Invalid Types',
        mealTypes: ['breakfast', 'snack'],
      },
      {
        id: 'valid',
        title: 'Valid Types',
        mealTypes: ['breakfast', 'dinner'],
      },
      {
        id: 'suspicious',
        title: 'Thai Red Curry with Rice',
        mealTypes: ['breakfast', 'lunch'],
      },
    ]);

    expect(valid).toHaveLength(1);
    expect(valid[0]).toMatchObject({
      recipeId: 'valid',
      issues: [],
      mealTypes: ['breakfast', 'dinner'],
    });

    const issuesById = Object.fromEntries(invalid.map((entry) => [entry.recipeId, entry.issues]));

    expect(issuesById.missing).toContain('Missing mealTypes array');
    expect(issuesById.empty).toContain('Empty mealTypes array');
    expect(issuesById.invalid).toContain('Invalid meal types: snack');
    expect(issuesById.suspicious).toContain(
      'Unexpected breakfast classification (keywords: curry)'
    );
  });

  it('loads recipes via the provided delegate before evaluation', async () => {
    const findMany = vi
      .fn()
      .mockResolvedValue([{ id: '1', title: 'Recipe', mealTypes: ['lunch'] }]);
    const delegate = { findMany } as unknown as Parameters<typeof validateMealTypes>[0];
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const result = await validateMealTypes(delegate);

    expect(findMany).toHaveBeenCalledWith({
      select: { id: true, title: true, mealTypes: true },
    });
    expect(result.valid).toHaveLength(1);
    expect(result.invalid).toHaveLength(0);

    logSpy.mockRestore();
  });
});

describe('fixCorruptedMealTypes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('filters invalid types and applies fallback defaults before updating', async () => {
    const updates: Array<{ where: { id: string }; data: { mealTypes: string[] } }> = [];
    const update = vi.fn(
      async (payload: { where: { id: string }; data: { mealTypes: string[] } }) => {
        updates.push(payload);
        return payload;
      }
    );
    const recipeModel = { update } as unknown as Parameters<typeof fixCorruptedMealTypes>[1];

    const corrupted: ValidationResult[] = [
      {
        recipeId: 'keep-valid',
        title: 'Keep Valid',
        mealTypes: ['breakfast', 'snack'],
        issues: ['Invalid meal types: snack'],
      },
      {
        recipeId: 'fallback',
        title: 'Fallback',
        mealTypes: [],
        issues: ['Empty mealTypes array'],
      },
      {
        recipeId: 'thai-curry',
        title: 'Thai Red Curry with Rice',
        mealTypes: ['breakfast', 'lunch', 'dinner'],
        issues: ['Unexpected breakfast classification (keywords: curry)'],
      },
    ];

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await fixCorruptedMealTypes(corrupted, recipeModel);

    expect(update).toHaveBeenCalledTimes(3);
    expect(updates[0]).toEqual({
      where: { id: 'keep-valid' },
      data: { mealTypes: ['breakfast'] },
    });
    expect(updates[1]).toEqual({
      where: { id: 'fallback' },
      data: { mealTypes: ['lunch', 'dinner'] },
    });
    expect(updates[2]).toEqual({
      where: { id: 'thai-curry' },
      data: { mealTypes: ['lunch', 'dinner'] },
    });

    logSpy.mockRestore();
  });
});
