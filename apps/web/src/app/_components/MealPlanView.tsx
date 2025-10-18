'use client';

import Image from 'next/image';
import recipesDataRaw from '~/mockData/recipes.json';
import type { MealPreferences } from './MealPlanWizard';

type Recipe = {
  id: string | number;
  day: string | number;
  title: string;
  image: string;
  kcal: number;
  prepTime: string | number;
  tags: string[];
};

const recipesData = recipesDataRaw as Recipe[];
interface MealPlanViewProps {
  preferences: MealPreferences;
  onViewShoppingList: () => void;
}

export default function MealPlanView({ preferences, onViewShoppingList }: MealPlanViewProps) {
  // Filter recipes based on number of days
  const recipes = recipesData.slice(0, preferences.days);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
            Your Weekly Meal Plan
          </h1>
          <p className="mt-2 text-base text-gray-600">
            {preferences.days} days · {preferences.mealsPerDay} {preferences.mealsPerDay === 1 ? 'meal' : 'meals'}/day · {preferences.householdSize}{' '}
            {preferences.householdSize === 1 ? 'person' : 'people'}
          </p>
          <div className="mt-4 inline-flex flex-wrap items-center gap-2">
            {preferences.isVegetarian && (
              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                🌱 Vegetarian
              </span>
            )}
            {preferences.isDairyFree && (
              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                🥛 Dairy-free
              </span>
            )}
          </div>
        </div>

        {/* Recipe grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
            >
              {/* Recipe image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
                {/* Day badge */}
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur-sm">
                  {recipe.day}
                </div>
              </div>

              {/* Recipe details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{recipe.title}</h3>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{recipe.prepTime}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🔥</span>
                    <span>{recipe.kcal} kcal</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div className="mt-12 text-center">
          <button
            onClick={onViewShoppingList}
            className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            View Shopping List
          </button>
        </div>
      </div>
    </div>
  );
}
