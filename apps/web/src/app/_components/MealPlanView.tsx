'use client';

import { useState } from 'react';
import type { MealPreferences } from './MealPlanWizard';
import RecipeCard from './RecipeCard';
import RecipeDetailModal from './RecipeDetailModal';

type RecipeIngredient = {
  id: string;
  quantity: number;
  unit: string;
  ingredient: {
    id: string;
    name: string;
    category: string;
  };
};

type Recipe = {
  id: string;
  title: string;
  imageUrl: string | null;
  calories: number;
  minutes: number;
  instructionsMd: string;
  isVegetarian: boolean;
  isDairyFree: boolean;
  ingredients: RecipeIngredient[];
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
  const [selectedItem, setSelectedItem] = useState<MealPlanItem | null>(null);

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

  const handleOpenDetail = (item: MealPlanItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  const handleSwapRecipe = () => {
    // TODO: Implement recipe swapping functionality
    alert('Recipe swapping feature coming soon!');
    handleCloseDetail();
  };

  return (
    <>
      <div className="space-y-6">
        {plan ? (
          // Real plan view with enhanced recipe cards
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

      {/* Recipe Detail Modal */}
      {selectedItem && (
        <RecipeDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={handleCloseDetail}
          onSwapRecipe={handleSwapRecipe}
        />
      )}
    </>
  );
}
