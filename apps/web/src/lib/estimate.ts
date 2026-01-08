import type {
  BudgetEstimateConfidence,
  BudgetEstimateMode,
} from '~/server/services/budgetEstimator';

export const DEFAULT_ESTIMATE_MODE: BudgetEstimateMode = 'standard';
export const ESTIMATE_DISCLAIMER = 'Estimates use ingredient category baselines; totals may vary.';

export type { BudgetEstimateConfidence, BudgetEstimateMode };
