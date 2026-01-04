'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { RecipeCard } from '~/components/features/recipe/RecipeCard';
import { RecipeDetailModal } from '~/components/features/recipe/RecipeDetailModal';
import { EmptyState } from '~/components/shared/EmptyState';
import { api } from '~/trpc/react';
import type {
  MealPreferences,
  MealPlanItem,
  MealPlan,
} from '~/types/meal-plan';

interface MealPlanViewProps {
  plan?: MealPlan;
  preferences?: MealPreferences;
  onViewShoppingList?: () => void;
  shoppingListAnchorId?: string;
}

/**
 * Ensures a date value is converted to a Date object
 * Handles both Date objects and ISO string dates
 */
function ensureDate(date: Date | string): Date {
  if (date instanceof Date) return date;
  return new Date(date);
}

export default function MealPlanView({
  plan,
  preferences,
  onViewShoppingList,
  shoppingListAnchorId,
}: MealPlanViewProps) {
  const [selectedItem, setSelectedItem] = useState<MealPlanItem | null>(null);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const router = useRouter();

  const swapRecipeMutation = api.plan.swapRecipe.useMutation({
    onSuccess: () => {
      // Refresh the page to show the updated plan
      router.refresh();
    },
  });

  const scrollToAnchor = useCallback((anchor?: string) => {
    if (!anchor) return;
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleNavigatorSelect = (anchor: string) => {
    scrollToAnchor(anchor);
    setIsNavigatorOpen(false);
  };

  // Use real plan data if available, otherwise fall back to preferences-based view
  if (!plan && !preferences) {
    return (
      <EmptyState
        icon={<Sparkles className="h-8 w-8" />}
        iconColor="emerald"
        title="Let's create your first meal plan!"
        description="Start planning delicious, healthy meals for the week. Our AI will help you create a personalized plan based on your preferences."
        actionLabel="Start planning"
        actionHref="/planner"
        preview={
          <div className="rounded-xl border border-gray-200 bg-white/50 p-4 text-left">
            <p className="mb-3 text-sm font-semibold text-gray-700">You&apos;ll get:</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>7 days of personalized meals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Automatic shopping list</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Nutritional information</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>Step-by-step recipes</span>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  // Group items by day for real plan data
  const dayGroups = plan
    ? Array.from({ length: plan.days }, (_, i) => ({
        dayIndex: i,
        date: new Date(ensureDate(plan.startDate).getTime() + i * 24 * 60 * 60 * 1000),
        items: plan.items
          .filter((item) => item.dayIndex === i)
          .sort((a, b) => {
            const mealOrder = { breakfast: 0, lunch: 1, dinner: 2 };
            return (
              (mealOrder[a.mealType as keyof typeof mealOrder] ?? 99) -
              (mealOrder[b.mealType as keyof typeof mealOrder] ?? 99)
            );
          }),
      }))
    : [];

  const handleOpenDetail = (item: MealPlanItem) => {
    setSelectedItem(item);
    setSwapError(null); // Clear any previous errors
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    setSwapError(null); // Clear errors when closing
  };

  const handleSwapRecipe = async () => {
    if (!plan || !selectedItem) return;

    setIsSwapping(true);
    setSwapError(null); // Clear any previous errors
    try {
      await swapRecipeMutation.mutateAsync({
        planId: plan.id,
        mealPlanItemId: selectedItem.id,
      });
      handleCloseDetail();
    } catch (error) {
      console.error('Failed to swap recipe:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'message' in error.data
          ? String(error.data.message)
          : error && typeof error === 'object' && 'message' in error
            ? String(error.message)
            : 'Failed to swap recipe. Please try again.';
      setSwapError(errorMessage);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <>
      <div className="space-y-6 pb-28 lg:pb-0">
        {plan ? (
          // Real plan view with enhanced recipe cards
          <>
            {dayGroups.map((day) => (
              <div
                key={day.dayIndex}
                id={`plan-day-${day.dayIndex}`}
                className="scroll-mt-28 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:rounded-xl sm:p-6"
              >
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Day {day.dayIndex + 1} -{' '}
                  {day.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <div className="space-y-4">
                  {day.items.map((item) => (
                    <RecipeCard key={item.id} item={item} onOpenDetail={handleOpenDetail} />
                  ))}
                </div>
              </div>
            ))}

            {onViewShoppingList && (
              <div className="text-center">
                <button
                  onClick={onViewShoppingList}
                  className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  View Shopping List
                </button>
              </div>
            )}
          </>
        ) : preferences ? (
          // Legacy preferences view (fallback for backward compatibility)
          <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-gray-600">
              Plan for {preferences.days} days · {preferences.mealsPerDay}{' '}
              {preferences.mealsPerDay === 1 ? 'meal' : 'meals'}/day
            </p>
            {preferences.isVegetarian && (
              <span className="mt-2 inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                🌱 Vegetarian
              </span>
            )}
          </div>
        ) : null}
      </div>

      {plan && plan.days > 0 && (
        <div className="lg:hidden">
          {isNavigatorOpen && (
            <div
              role="presentation"
              className="fixed inset-0 z-30 bg-gray-900/10"
              onClick={() => setIsNavigatorOpen(false)}
            />
          )}
          <button
            type="button"
            onClick={() => setIsNavigatorOpen((prev) => !prev)}
            className="fixed bottom-20 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-expanded={isNavigatorOpen}
            aria-controls="plan-mobile-navigator"
          >
            <span className="sr-only">Open plan navigation</span>
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {isNavigatorOpen && (
            <div
              id="plan-mobile-navigator"
              className="fixed bottom-40 right-4 z-40 w-72 max-w-[calc(100vw-2rem)] rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-gray-200"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Jump to</p>
                <button
                  type="button"
                  onClick={() => setIsNavigatorOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  aria-label="Close plan navigation"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {dayGroups.map((day) => (
                  <button
                    key={day.dayIndex}
                    type="button"
                    onClick={() => handleNavigatorSelect(`plan-day-${day.dayIndex}`)}
                    className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-emerald-400 hover:text-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 min-h-[52px]"
                  >
                    <span>
                      Day {day.dayIndex + 1}
                      <span className="block text-xs font-normal text-gray-700">
                        {day.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </span>
                    <span aria-hidden="true">↘</span>
                  </button>
                ))}

                {shoppingListAnchorId && (
                  <button
                    type="button"
                    onClick={() => handleNavigatorSelect(shoppingListAnchorId)}
                    className="flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 min-h-[52px]"
                  >
                    Shopping List
                    <span aria-hidden="true">🛒</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedItem && (
        <RecipeDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={handleCloseDetail}
          onSwapRecipe={handleSwapRecipe}
          isSwapping={isSwapping}
          swapError={swapError}
        />
      )}
    </>
  );
}
