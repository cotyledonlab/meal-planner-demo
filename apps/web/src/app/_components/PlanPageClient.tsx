'use client';

import { useState, useCallback, useEffect } from 'react';
import { api, type RouterOutputs } from '~/trpc/react';
import MealPlanView from './MealPlanView';
import {
  PlanFilterPanel,
  type PlanFilters,
  type TimePreferences,
} from '~/components/features/meal-plan/PlanFilterPanel';

// Use the actual type returned by the API
type PlanData = NonNullable<RouterOutputs['plan']['getById']>;

interface PlanPageClientProps {
  planId: string;
  initialPlan: PlanData;
  shoppingListAnchorId: string;
  isPremium: boolean;
}

export default function PlanPageClient({
  planId,
  initialPlan,
  shoppingListAnchorId,
  isPremium,
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

  const { data: preferences, isLoading: preferencesLoading } = api.preferences.get.useQuery();
  const savePreferences = api.preferences.update.useMutation();
  const [timePreferences, setTimePreferences] = useState<TimePreferences>({
    weeknightMaxTimeMinutes: null,
    weeklyTimeBudgetMinutes: null,
    prioritizeWeeknights: true,
  });

  useEffect(() => {
    if (!preferences) {
      return;
    }

    setTimePreferences({
      weeknightMaxTimeMinutes: preferences.weeknightMaxTimeMinutes ?? null,
      weeklyTimeBudgetMinutes: preferences.weeklyTimeBudgetMinutes ?? null,
      prioritizeWeeknights: preferences.prioritizeWeeknights ?? true,
    });
  }, [preferences]);

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

  const handleTimePreferencesChange = useCallback(
    (next: TimePreferences) => {
      setTimePreferences(next);

      if (!isPremium || !preferences) {
        return;
      }

      savePreferences.mutate({
        householdSize: preferences.householdSize,
        mealsPerDay: preferences.mealsPerDay,
        days: preferences.days,
        isVegetarian: preferences.isVegetarian,
        isDairyFree: preferences.isDairyFree,
        dislikes: preferences.dislikes ?? '',
        weeknightMaxTimeMinutes: next.weeknightMaxTimeMinutes,
        weeklyTimeBudgetMinutes: next.weeklyTimeBudgetMinutes,
        prioritizeWeeknights: next.prioritizeWeeknights,
      });
    },
    [isPremium, preferences, savePreferences]
  );

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
        isPremium={isPremium}
        timePreferences={timePreferences}
        onTimePreferencesChange={handleTimePreferencesChange}
        isSavingPreferences={preferencesLoading || savePreferences.isPending}
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
