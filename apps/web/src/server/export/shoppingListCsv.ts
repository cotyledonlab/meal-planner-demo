import { stringify } from 'csv-stringify/sync';
import { createPlanFilename } from '~/lib/export/plan';

export type ShoppingListCsvItem = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
};

export function generateShoppingListCsv(items: ShoppingListCsvItem[]): string {
  const rows = items.map((item) => ({
    item: item.name,
    quantity: Number.isFinite(item.quantity) ? Math.round(item.quantity * 100) / 100 : 'N/A',
    unit: item.unit,
    category: item.category,
    checked: item.checked ? 'yes' : 'no',
  }));

  return stringify(rows, {
    header: true,
    columns: [
      { key: 'item', header: 'Item' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'unit', header: 'Unit' },
      { key: 'category', header: 'Category' },
      { key: 'checked', header: 'Checked' },
    ],
  });
}

export function createShoppingListCsvFilename(startDate: Date, days: number): string {
  return createPlanFilename('shopping-list', startDate, days, 'csv');
}
