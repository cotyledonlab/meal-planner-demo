import { stringify } from 'csv-stringify/sync';
import { createPlanFilename } from '~/lib/export/plan';
import {
  DEFAULT_ESTIMATE_MODE,
  ESTIMATE_DISCLAIMER,
  type BudgetEstimateConfidence,
  type BudgetEstimateMode,
} from '~/lib/estimate';

export type ShoppingListCsvItem = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
};

export type ShoppingListEstimateSummary = {
  mode: BudgetEstimateMode;
  total: number | null;
  confidence: BudgetEstimateConfidence | null;
  missingItemCount: number | null;
  generatedAt: Date;
  disclaimer: string;
  locked: boolean;
};

const formatEstimateMode = (mode: BudgetEstimateMode): string =>
  `${mode.charAt(0).toUpperCase()}${mode.slice(1)}`;

const formatEstimateConfidence = (confidence: BudgetEstimateConfidence): string =>
  `${confidence.charAt(0).toUpperCase()}${confidence.slice(1)}`;

export function generateShoppingListCsv(
  items: ShoppingListCsvItem[],
  estimate?: ShoppingListEstimateSummary | null
): string {
  const estimateMode = estimate?.mode ?? DEFAULT_ESTIMATE_MODE;
  const isEstimateLocked = estimate?.locked ?? true;
  const estimateModeLabel = formatEstimateMode(estimateMode);
  const estimateTotal =
    !isEstimateLocked && estimate?.total != null ? estimate.total.toFixed(2) : '';
  const estimateConfidence =
    !isEstimateLocked && estimate?.confidence ? formatEstimateConfidence(estimate.confidence) : '';
  const estimateMissingItems =
    !isEstimateLocked && estimate?.missingItemCount != null ? estimate.missingItemCount : '';
  const estimateGeneratedAt = estimate?.generatedAt ? estimate.generatedAt.toISOString() : '';
  const estimateDisclaimer = estimate?.disclaimer ?? ESTIMATE_DISCLAIMER;

  const rows = items.map((item) => ({
    item: item.name,
    quantity: Number.isFinite(item.quantity)
      ? Math.round(item.quantity * 100) / 100
      : item.quantity,
    unit: item.unit,
    category: item.category,
    checked: item.checked ? 'yes' : 'no',
    estimateMode: estimateModeLabel,
    estimateTotal,
    estimateConfidence,
    estimateMissingItems,
    estimateGeneratedAt,
    estimateDisclaimer,
  }));

  return stringify(rows, {
    header: true,
    columns: [
      { key: 'item', header: 'Item' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'unit', header: 'Unit' },
      { key: 'category', header: 'Category' },
      { key: 'checked', header: 'Checked' },
      { key: 'estimateMode', header: 'Estimate Mode' },
      { key: 'estimateTotal', header: 'Estimate Total' },
      { key: 'estimateConfidence', header: 'Estimate Confidence' },
      { key: 'estimateMissingItems', header: 'Estimate Missing Items' },
      { key: 'estimateGeneratedAt', header: 'Estimate Generated At' },
      { key: 'estimateDisclaimer', header: 'Estimate Disclaimer' },
    ],
  });
}

export function createShoppingListCsvFilename(startDate: Date, days: number): string {
  return createPlanFilename('shopping-list', startDate, days, 'csv');
}
