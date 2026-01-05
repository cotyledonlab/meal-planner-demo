'use client';

import { useState, useCallback } from 'react';
import { api, type RouterOutputs } from '~/trpc/react';
import MealPlanView from './MealPlanView';
import { PlanFilterPanel, type PlanFilters } from '~/components/features/meal-plan/PlanFilterPanel';

// Use the actual type returned by the API
type PlanData = NonNullable<RouterOutputs['plan']['getById']>;

interface PlanPageClientProps {
  planId: string;
  initialPlan: PlanData;
  shoppingListAnchorId: string;
}

export default function PlanPageClient({
  planId,
  initialPlan,
  shoppingListAnchorId,
}: PlanPageClientProps) {
  const utils = api.useUtils();

  // Filter state
  const [filters, setFilters] = useState<PlanFilters>({
    difficulty: null,
    maxTotalTime: null,
    excludeAllergenTagIds: [],
    isVegetarian: false,
    isDairyFree: false,
  });

  // Regeneration mutation
  const regenerateMutation = api.plan.regenerate.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh data
      void utils.plan.getById.invalidate({ planId });
      void utils.shoppingList.getForPlan.invalidate({ planId });
    },
  });

  // Handle regeneration
  const handleRegenerate = useCallback(() => {
    regenerateMutation.mutate({
      planId,
      difficulty: filters.difficulty,
      maxTotalTime: filters.maxTotalTime,
      excludeAllergenNames:
        filters.excludeAllergenTagIds.length > 0 ? filters.excludeAllergenTagIds : undefined,
      isVegetarian: filters.isVegetarian || undefined,
      isDairyFree: filters.isDairyFree || undefined,
    });
  }, [planId, filters, regenerateMutation]);

  // Get current plan data (use query to get updates after regeneration)
  const { data: currentPlan } = api.plan.getById.useQuery(
    { planId },
    {
      initialData: initialPlan,
      refetchOnMount: false,
    }
  );

  const plan = currentPlan ?? initialPlan;

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <PlanFilterPanel
        currentFilters={filters}
        onFiltersChange={setFilters}
        onRegenerate={handleRegenerate}
        isRegenerating={regenerateMutation.isPending}
      />

      {/* Regeneration error message */}
      {regenerateMutation.isError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <strong>Error:</strong>{' '}
          {regenerateMutation.error?.message ?? 'Failed to regenerate plan. Please try again.'}
        </div>
      )}

      {/* Regeneration success message */}
      {regenerateMutation.isSuccess && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          Plan regenerated successfully with your new filters!
        </div>
      )}

      {/* Loading overlay during regeneration */}
      <div className={regenerateMutation.isPending ? 'opacity-50 pointer-events-none' : ''}>
        <MealPlanView plan={plan} shoppingListAnchorId={shoppingListAnchorId} />
      </div>
    </div>
  );
}
