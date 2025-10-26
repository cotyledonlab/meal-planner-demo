'use client';

import Image from 'next/image';
import type { MealPreferences } from './MealPlanWizard';

type Recipe = {
  id: string;
  title: string;
  imageUrl: string | null;
  calories: number;
  minutes: number;
};

type MealPlanItem = {
  id: string;
  dayIndex: number;
  mealType: string;
  servings: number;
  recipe: Recipe;
};

type MealPlan = {
  id: string;
  startDate: Date | string;
  days: number;
  items: MealPlanItem[];
};

interface MealPlanViewProps {
  plan?: MealPlan;
  preferences?: MealPreferences;
  onViewShoppingList?: () => void;
}

/**
 * Ensures a date value is converted to a Date object
 * Handles both Date objects and ISO string dates
 */
function ensureDate(date: Date | string): Date {
  if (date instanceof Date) return date;
  return new Date(date);
}

export default function MealPlanView({ plan, preferences, onViewShoppingList }: MealPlanViewProps) {
  // Use real plan data if available, otherwise fall back to preferences-based view
  if (!plan && !preferences) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <p className="text-gray-600">No meal plan available</p>
      </div>
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

  return (
    <div className="space-y-6">
      {plan ? (
        // Real plan view
        <>
          {dayGroups.map((day) => (
            <div
              key={day.dayIndex}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
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
                  <div key={item.id} className="flex gap-4">
                    {/* Recipe image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                      <Image
                        src={item.recipe.imageUrl ?? '/placeholder-recipe.jpg'}
                        alt={item.recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Recipe details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase text-emerald-600">
                            {item.mealType}
                          </p>
                          <h4 className="mt-1 text-base font-semibold text-gray-900">
                            {item.recipe.title}
                          </h4>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{item.recipe.minutes} min</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>🔥</span>
                          <span>{item.recipe.calories} kcal</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>👥</span>
                          <span>{item.servings} servings</span>
                        </span>
                      </div>
                    </div>
                  </div>
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
  );
}
