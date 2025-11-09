import type { PlanTier } from '@meal-planner-demo/constants';

export const PLAN_SIGNUP_ROUTES: Record<PlanTier, string> = {
  basic: '/auth/signup',
  premium: '/auth/signup?tier=premium',
};

export const DEFAULT_SELECTED_PLAN: PlanTier = 'premium';

export const getSignupHref = (tier: PlanTier) => PLAN_SIGNUP_ROUTES[tier];
