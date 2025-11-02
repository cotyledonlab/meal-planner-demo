import { describe, expect, it } from 'vitest';

import { validateMealTypes } from './seed';

describe('validateMealTypes (seed helper)', () => {
  it('throws when mealTypes array is missing or empty', () => {
    expect(() => validateMealTypes(undefined, 'Missing Recipe')).toThrow(
      /missing or empty mealTypes array/
    );
    expect(() => validateMealTypes([], 'Empty Recipe')).toThrow(/missing or empty mealTypes array/);
  });

  it('throws when mealTypes contains values outside the allowed list', () => {
    expect(() => validateMealTypes(['lunch', 'dessert'], 'Invalid Recipe')).toThrow(
      /invalid meal types: \[dessert\]/
    );
  });

  it('returns the validated mealTypes array when it is valid', () => {
    const result = validateMealTypes(['breakfast', 'dinner'], 'Valid Recipe');
    expect(result).toEqual(['breakfast', 'dinner']);
  });
});
