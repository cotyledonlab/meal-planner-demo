import { describe, expect, it } from 'vitest';
import { ESTIMATE_DISCLAIMER } from '~/lib/estimate';
import { generateShoppingListCsv } from './shoppingListCsv';

describe('generateShoppingListCsv', () => {
  it('produces CSV with expected headers and values', () => {
    const generatedAt = new Date('2025-02-02T10:30:00Z');
    const csv = generateShoppingListCsv(
      [
        { name: 'Tomato', quantity: 2.333, unit: 'pcs', category: 'produce', checked: false },
        { name: 'Olive Oil', quantity: 500, unit: 'ml', category: 'pantry', checked: true },
      ],
      {
        mode: 'standard',
        total: 18.75,
        confidence: 'high',
        missingItemCount: 0,
        generatedAt,
        disclaimer: ESTIMATE_DISCLAIMER,
        locked: false,
      }
    );

    expect(csv.split('\n')[0]).toBe(
      'Item,Quantity,Unit,Category,Checked,Estimate Mode,Estimate Total,Estimate Confidence,Estimate Missing Items,Estimate Generated At,Estimate Disclaimer'
    );
    expect(csv).toContain('Tomato,2.33,pcs,produce,no');
    expect(csv).toContain('Olive Oil,500,ml,pantry,yes');
    expect(csv).toContain(
      `Standard,18.75,High,0,${generatedAt.toISOString()},${ESTIMATE_DISCLAIMER}`
    );
  });

  it('leaves estimate values blank when locked', () => {
    const generatedAt = new Date('2025-02-02T10:30:00Z');
    const csv = generateShoppingListCsv(
      [{ name: 'Tomato', quantity: 1, unit: 'pcs', category: 'produce', checked: false }],
      {
        mode: 'standard',
        total: null,
        confidence: null,
        missingItemCount: null,
        generatedAt,
        disclaimer: ESTIMATE_DISCLAIMER,
        locked: true,
      }
    );

    const dataRow = csv.split('\n')[1] ?? '';
    const columns = dataRow.split(',');

    expect(columns[5]).toBe('Standard');
    expect(columns[6]).toBe('');
    expect(columns[7]).toBe('');
    expect(columns[8]).toBe('');
    expect(columns[9]).toBe(generatedAt.toISOString());
    expect(columns[10]).toBe(ESTIMATE_DISCLAIMER);
  });
});
