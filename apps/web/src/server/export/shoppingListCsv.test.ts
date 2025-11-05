import { describe, expect, it } from 'vitest';
import { generateShoppingListCsv } from './shoppingListCsv';

describe('generateShoppingListCsv', () => {
  it('produces CSV with expected headers and values', () => {
    const csv = generateShoppingListCsv([
      { name: 'Tomato', quantity: 2.333, unit: 'pcs', category: 'produce', checked: false },
      { name: 'Olive Oil', quantity: 500, unit: 'ml', category: 'pantry', checked: true },
    ]);

    expect(csv.split('\n')[0]).toBe('Item,Quantity,Unit,Category,Checked');
    expect(csv).toContain('Tomato,2.33,pcs,produce,no');
    expect(csv).toContain('Olive Oil,500,ml,pantry,yes');
  });
});
