'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  getRecipeTotalTime,
  getPrimaryImageUrl,
  type RecipeImage,
} from '@meal-planner-demo/types';
import {
  calculateDifficulty,
  getDifficultyColor,
  RECIPE_PLACEHOLDER_IMAGE,
} from '~/lib/recipeUtils';

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

type DietTagRelation = {
  dietTag: {
    id: string;
    name: string;
  };
};

type Recipe = {
  id: string;
  title: string;
  calories: number;
  ingredients: RecipeIngredient[];
  // New fields (optional for backward compatibility)
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  totalTimeMinutes?: number | null;
  images?: RecipeImage[];
  dietTags?: DietTagRelation[];
  // Legacy fields (kept for backward compatibility with existing data)
  minutes: number;
  imageUrl: string | null;
  isVegetarian: boolean;
  isDairyFree: boolean;
  instructionsMd: string;
};

// Helper to check if recipe has a diet tag
function hasDietTag(recipe: Recipe, tagName: string): boolean {
  if (recipe.dietTags) {
    return recipe.dietTags.some((dt) => dt.dietTag.name.toLowerCase() === tagName);
  }
  // Fallback to deprecated fields
  if (tagName === 'vegetarian') return recipe.isVegetarian ?? false;
  if (tagName === 'dairy-free') return recipe.isDairyFree ?? false;
  return false;
}

type MealPlanItem = {
  id: string;
  dayIndex: number;
  mealType: string;
  servings: number;
  recipe: Recipe;
};

interface RecipeCardProps {
  item: MealPlanItem;
  onOpenDetail: (item: MealPlanItem) => void;
}

/**
 * Get top 3 ingredients for preview
 */
function getIngredientPreview(ingredients: RecipeIngredient[]): string {
  const topIngredients = ingredients
    .slice(0, 3)
    .map((ri) => ri.ingredient.name)
    .join(', ');

  return ingredients.length > 3 ? `${topIngredients}...` : topIngredients;
}

export default function RecipeCard({ item, onOpenDetail }: RecipeCardProps) {
  const [isActive, setIsActive] = useState(false);
  const { recipe, mealType, servings } = item;

  const totalTime = getRecipeTotalTime(recipe);
  const difficulty = calculateDifficulty(totalTime, recipe.ingredients.length);
  const ingredientPreview = getIngredientPreview(recipe.ingredients);
  const imageUrl = getPrimaryImageUrl(recipe, RECIPE_PLACEHOLDER_IMAGE);
  const isVegetarian = hasDietTag(recipe, 'vegetarian');
  const isDairyFree = hasDietTag(recipe, 'dairy-free');

  return (
    <button
      type="button"
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-white text-left shadow-md ring-1 ring-gray-200 transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:rounded-xl"
      onClick={() => onOpenDetail(item)}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      aria-label={`View details for ${recipe.title}`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
        {/* Recipe image - larger and more prominent */}
        <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-gray-200 sm:h-40 sm:w-40 sm:flex-shrink-0 sm:rounded-lg">
          <Image
            src={imageUrl ?? RECIPE_PLACEHOLDER_IMAGE}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Difficulty badge on image */}
          <div className="absolute right-2 top-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${getDifficultyColor(difficulty)}`}
            >
              {difficulty}
            </span>
          </div>
        </div>

        {/* Recipe details */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Meal type badge with improved styling */}
              <span className="inline-flex min-h-[32px] items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {mealType}
              </span>

              {/* Dietary tags */}
              <div className="mt-2 flex flex-wrap gap-1">
                {isVegetarian && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    🌱 Vegetarian
                  </span>
                )}
                {isDairyFree && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    🥛 Dairy-Free
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Recipe title */}
          <h4 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
            {recipe.title}
          </h4>

          {/* Ingredient preview */}
          {ingredientPreview && (
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Ingredients:</span> {ingredientPreview}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{totalTime} min</span>
            </span>
            <span className="flex items-center gap-1">
              <span>🔥</span>
              <span>{recipe.calories} kcal</span>
            </span>
            <span className="flex items-center gap-1">
              <span>👥</span>
              <span>{servings} servings</span>
            </span>
            <span className="flex items-center gap-1">
              <span>🥘</span>
              <span>{recipe.ingredients.length} ingredients</span>
            </span>
          </div>

          {/* Hover preview hint */}
          <div
            className={`mt-3 text-sm text-emerald-600 transition-opacity duration-200 ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            View full recipe details →
          </div>
        </div>
      </div>
    </button>
  );
}
