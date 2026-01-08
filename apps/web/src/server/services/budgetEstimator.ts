import { convertToNormalizedUnit } from '~/lib/unitConverter';
import type { NormalizedUnit } from '~/lib/unitConverter';

export type BudgetEstimateMode = 'cheap' | 'standard' | 'premium';
export type BudgetEstimateConfidence = 'high' | 'medium' | 'low';

export interface BudgetEstimateItem {
  category: string;
  quantity: number;
  unit: string;
}

export interface PriceBaselineInput {
  ingredientCategory: string;
  store: string;
  pricePerUnit: number;
  unit: string;
}

export interface BudgetEstimateTotals {
  cheap: number;
  standard: number;
  premium: number;
}

export interface BudgetEstimateResult {
  totals: BudgetEstimateTotals;
  missingItemCount: number;
  confidence: BudgetEstimateConfidence;
}

const normalizedUnits: NormalizedUnit[] = ['g', 'ml', 'pcs'];

const isNormalizedUnit = (unit: string): unit is NormalizedUnit =>
  normalizedUnits.includes(unit as NormalizedUnit);

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

const calculateMedian = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[mid]!;
  }

  return (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const normalizeItemQuantity = (
  item: BudgetEstimateItem
): { quantity: number; unit: NormalizedUnit } | null => {
  try {
    return convertToNormalizedUnit(item.quantity, item.unit);
  } catch {
    return null;
  }
};

const buildBaselineLookup = (
  baselines: PriceBaselineInput[]
): Map<string, Array<{ unit: NormalizedUnit; pricePerUnit: number }>> => {
  const lookup = new Map<string, Array<{ unit: NormalizedUnit; pricePerUnit: number }>>();

  for (const baseline of baselines) {
    if (!isNormalizedUnit(baseline.unit)) {
      continue;
    }

    const existing = lookup.get(baseline.ingredientCategory) ?? [];
    existing.push({ unit: baseline.unit, pricePerUnit: baseline.pricePerUnit });
    lookup.set(baseline.ingredientCategory, existing);
  }

  return lookup;
};

const getConfidenceLabel = (
  missingItemCount: number,
  totalItems: number
): BudgetEstimateConfidence => {
  if (totalItems === 0) {
    return 'low';
  }

  if (missingItemCount === 0) {
    return 'high';
  }

  const missingRatio = missingItemCount / totalItems;
  if (missingRatio <= 0.25) {
    return 'medium';
  }

  return 'low';
};

export const estimateBudget = (
  items: BudgetEstimateItem[],
  baselines: PriceBaselineInput[]
): BudgetEstimateResult => {
  const totals: BudgetEstimateTotals = { cheap: 0, standard: 0, premium: 0 };
  const baselinesByCategory = buildBaselineLookup(baselines);
  let missingItemCount = 0;

  for (const item of items) {
    const normalized = normalizeItemQuantity(item);
    if (!normalized) {
      missingItemCount += 1;
      continue;
    }

    const categoryBaselines = baselinesByCategory.get(item.category);
    if (!categoryBaselines) {
      missingItemCount += 1;
      continue;
    }

    const matchingBaselines = categoryBaselines.filter(
      (baseline) => baseline.unit === normalized.unit
    );
    if (matchingBaselines.length === 0) {
      missingItemCount += 1;
      continue;
    }

    const prices = matchingBaselines.map((baseline) => baseline.pricePerUnit);
    const cheapPrice = Math.min(...prices);
    const premiumPrice = Math.max(...prices);
    const standardPrice = calculateMedian(prices);

    totals.cheap += normalized.quantity * cheapPrice;
    totals.standard += normalized.quantity * standardPrice;
    totals.premium += normalized.quantity * premiumPrice;
  }

  return {
    totals: {
      cheap: roundCurrency(totals.cheap),
      standard: roundCurrency(totals.standard),
      premium: roundCurrency(totals.premium),
    },
    missingItemCount,
    confidence: getConfidenceLabel(missingItemCount, items.length),
  };
};
