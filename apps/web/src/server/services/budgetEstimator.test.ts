import { describe, expect, it } from 'vitest';
import { estimateBudget } from './budgetEstimator';

describe('estimateBudget', () => {
  it('returns totals for cheap/standard/premium using normalized units', () => {
    const baselines = [
      {
        ingredientCategory: 'protein',
        store: 'Aldi',
        pricePerUnit: 0.01,
        unit: 'g',
      },
      {
        ingredientCategory: 'protein',
        store: 'Lidl',
        pricePerUnit: 0.015,
        unit: 'g',
      },
      {
        ingredientCategory: 'protein',
        store: 'Tesco',
        pricePerUnit: 0.02,
        unit: 'g',
      },
      {
        ingredientCategory: 'vegetables',
        store: 'Aldi',
        pricePerUnit: 0.002,
        unit: 'g',
      },
      {
        ingredientCategory: 'vegetables',
        store: 'Tesco',
        pricePerUnit: 0.003,
        unit: 'g',
      },
    ];

    const items = [
      { category: 'protein', quantity: 500, unit: 'g' },
      { category: 'vegetables', quantity: 1, unit: 'kg' },
    ];

    const result = estimateBudget(items, baselines);

    expect(result.totals).toEqual({
      cheap: 7,
      standard: 10,
      premium: 13,
    });
    expect(result.missingItemCount).toBe(0);
    expect(result.confidence).toBe('high');
  });

  it('tracks missing items and confidence when baselines or units are unavailable', () => {
    const baselines = [
      {
        ingredientCategory: 'protein',
        store: 'Aldi',
        pricePerUnit: 0.01,
        unit: 'g',
      },
      {
        ingredientCategory: 'protein',
        store: 'Tesco',
        pricePerUnit: 0.02,
        unit: 'g',
      },
      {
        ingredientCategory: 'protein',
        store: 'Dunnes',
        pricePerUnit: 0.03,
        unit: 'g',
      },
    ];

    const items = [
      { category: 'protein', quantity: 100, unit: 'g' },
      { category: 'snacks', quantity: 2, unit: 'pcs' },
      { category: 'vegetables', quantity: 1, unit: 'pinch' },
    ];

    const result = estimateBudget(items, baselines);

    expect(result.totals).toEqual({
      cheap: 1,
      standard: 2,
      premium: 3,
    });
    expect(result.missingItemCount).toBe(2);
    expect(result.confidence).toBe('low');
  });
});
