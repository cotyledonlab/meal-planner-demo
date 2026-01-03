'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getRecipeTotalTime, getPrimaryImageUrl, type RecipeImage } from '@meal-planner-demo/types';
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

type AllergenTagRelation = {
  allergenTag: {
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
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  images?: RecipeImage[];
  dietTags?: DietTagRelation[];
  allergenTags?: AllergenTagRelation[];
  // Legacy fields (kept for backward compatibility with existing data)
  minutes: number | null;
  imageUrl: string | null;
  isVegetarian: boolean;
  isDairyFree: boolean;
  instructionsMd: string | null;
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

// Normalize database difficulty (uppercase) to display format (title case)
function normalizeDifficulty(
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | undefined
): 'Easy' | 'Medium' | 'Hard' | undefined {
  if (!difficulty) return undefined;
  const map: Record<'EASY' | 'MEDIUM' | 'HARD', 'Easy' | 'Medium' | 'Hard'> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
  };
  return map[difficulty];
}

// Get diet tags to display (beyond vegetarian/dairy-free)
function getDisplayDietTags(recipe: Recipe): string[] {
  if (!recipe.dietTags) return [];
  return recipe.dietTags
    .map((dt) => dt.dietTag.name)
    .filter((name) => !['vegetarian', 'dairy-free'].includes(name.toLowerCase()));
}

// Get allergen tags for display
function getAllergenTags(recipe: Recipe): string[] {
  if (!recipe.allergenTags) return [];
  return recipe.allergenTags.map((at) => at.allergenTag.name);
}

// Format time display with prep/cook breakdown
function formatTimeDisplay(recipe: Recipe): { total: number; breakdown: string | null } {
  const total = getRecipeTotalTime(recipe);
  const prep = recipe.prepTimeMinutes;
  const cook = recipe.cookTimeMinutes;

  if (prep && cook) {
    return { total, breakdown: `${prep}m prep + ${cook}m cook` };
  }
  return { total, breakdown: null };
}

export default function RecipeCard({ item, onOpenDetail }: RecipeCardProps) {
  const [isActive, setIsActive] = useState(false);
  const { recipe, mealType, servings } = item;

  const timeInfo = formatTimeDisplay(recipe);
  // Use database difficulty if available, otherwise calculate
  const difficulty =
    normalizeDifficulty(recipe.difficulty) ??
    calculateDifficulty(timeInfo.total, recipe.ingredients.length);
  const ingredientPreview = getIngredientPreview(recipe.ingredients);
  const imageUrl = getPrimaryImageUrl(recipe, RECIPE_PLACEHOLDER_IMAGE);
  const isVegetarian = hasDietTag(recipe, 'vegetarian');
  const isDairyFree = hasDietTag(recipe, 'dairy-free');
  const otherDietTags = getDisplayDietTags(recipe);
  const allergenTags = getAllergenTags(recipe);

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
                {otherDietTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 capitalize"
                  >
                    {tag}
                  </span>
                ))}
                {allergenTags.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                    ⚠️ Contains: {allergenTags.slice(0, 2).join(', ')}
                    {allergenTags.length > 2 && ` +${allergenTags.length - 2}`}
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
            <span className="flex items-center gap-1" title={timeInfo.breakdown ?? undefined}>
              <span>⏱️</span>
              <span>
                {timeInfo.total} min
                {timeInfo.breakdown && (
                  <span className="hidden sm:inline text-xs text-gray-400 ml-1">
                    ({timeInfo.breakdown})
                  </span>
                )}
              </span>
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
