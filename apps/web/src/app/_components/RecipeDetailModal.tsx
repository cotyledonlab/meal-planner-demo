'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import {
  getRecipeTotalTime,
  getPrimaryImageUrl,
  type RecipeImage,
  type RecipeStep,
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
  // New fields
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  totalTimeMinutes?: number | null;
  images?: RecipeImage[];
  steps?: RecipeStep[];
  dietTags?: DietTagRelation[];
  // Legacy fields (kept for backward compatibility)
  minutes: number | null;
  imageUrl: string | null;
  instructionsMd: string | null;
  isVegetarian: boolean;
  isDairyFree: boolean;
};

// Helper to check if recipe has a diet tag
function hasDietTag(recipe: Recipe, tagName: string): boolean {
  if (recipe.dietTags) {
    return recipe.dietTags.some((dt) => dt.dietTag.name.toLowerCase() === tagName);
  }
  // Fallback to deprecated fields
  if (tagName === 'vegetarian') return recipe.isVegetarian;
  if (tagName === 'dairy-free') return recipe.isDairyFree;
  return false;
}

// Get time breakdown - use actual values if available, otherwise estimate
function getTimeSplit(recipe: Recipe): { prep: number; cook: number; total: number } {
  const total = getRecipeTotalTime(recipe);

  if (recipe.prepTimeMinutes != null || recipe.cookTimeMinutes != null) {
    return {
      prep: recipe.prepTimeMinutes ?? 0,
      cook: recipe.cookTimeMinutes ?? 0,
      total,
    };
  }

  // Fallback: estimate 30% prep, 70% cook
  const prep = Math.floor(total * 0.3);
  return { prep, cook: total - prep, total };
}

// Get instructions - use steps relation if available, otherwise parse markdown
function getInstructions(recipe: Recipe): string[] {
  if (recipe.steps && recipe.steps.length > 0) {
    return recipe.steps.sort((a, b) => a.stepNumber - b.stepNumber).map((step) => step.instruction);
  }

  // Fallback to parsing instructionsMd
  if (!recipe.instructionsMd) {
    return [];
  }
  return parseInstructionsMd(recipe.instructionsMd);
}

type MealPlanItem = {
  id: string;
  dayIndex: number;
  mealType: string;
  servings: number;
  recipe: Recipe;
};

interface RecipeDetailModalProps {
  item: MealPlanItem;
  isOpen: boolean;
  onClose: () => void;
  onSwapRecipe?: () => void;
  isSwapping?: boolean;
  swapError?: string | null;
}

/**
 * Parse markdown instructions into steps (fallback for legacy data)
 */
function parseInstructionsMd(markdown: string): string[] {
  if (!markdown) return ['No instructions available.'];

  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const steps: string[] = [];
  let skipRemaining = false;

  for (const line of lines) {
    if (/^#+\s+/i.test(line)) {
      if (/^#+\s+tips/i.test(line)) {
        skipRemaining = true;
      }
      continue;
    }

    if (skipRemaining) continue;

    const normalized = line
      .replace(/^[\d]+[.)]\s*/, '')
      .replace(/^[-*]\s*/, '')
      .trim();

    if (normalized.length === 0) continue;
    steps.push(normalized);
  }

  return steps.length > 0 ? steps : ['No instructions available.'];
}

/**
 * Handle print recipe
 */
function handlePrint() {
  window.print();
}

/**
 * Handle share recipe
 */
async function handleShare(recipe: Recipe) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: window.location.href,
      });
    } catch {
      // Fallback to copy link
      await copyLink();
    }
  } else {
    await copyLink();
  }
}

/**
 * Copy current URL to clipboard
 */
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    alert('Recipe link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy link:', error);
  }
}

export default function RecipeDetailModal({
  item,
  isOpen,
  onClose,
  onSwapRecipe,
  isSwapping = false,
  swapError = null,
}: RecipeDetailModalProps) {
  const { recipe, mealType, servings } = item;

  const timeSplit = getTimeSplit(recipe);
  const difficulty = calculateDifficulty(timeSplit.total, recipe.ingredients.length);
  const instructions = getInstructions(recipe);
  const imageUrl = getPrimaryImageUrl(recipe, RECIPE_PLACEHOLDER_IMAGE);
  const isVegetarian = hasDietTag(recipe, 'vegetarian');
  const isDairyFree = hasDietTag(recipe, 'dairy-free');

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-0 sm:p-4">
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-none bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white p-2.5 text-gray-600 shadow-lg transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Hero Image */}
          <div className="relative h-56 w-full overflow-hidden bg-gray-200 sm:h-64 sm:rounded-t-2xl">
            <Image
              src={imageUrl ?? RECIPE_PLACEHOLDER_IMAGE}
              alt={recipe.title}
              fill
              className="object-cover"
            />

            {/* Overlay badges */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${getDifficultyColor(difficulty)}`}
              >
                {difficulty}
              </span>
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold uppercase text-white">
                {mealType}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:max-h-[calc(100vh-20rem)] sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{recipe.title}</h2>

              {/* Dietary tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {isVegetarian && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    🌱 Vegetarian
                  </span>
                )}
                {isDairyFree && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    🥛 Dairy-Free
                  </span>
                )}
              </div>

              {/* Stats grid */}
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <div className="text-2xl">⏱️</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {timeSplit.total} min
                  </div>
                  <div className="text-xs text-gray-600">Total Time</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <div className="text-2xl">🔥</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {recipe.calories} kcal
                  </div>
                  <div className="text-xs text-gray-600">Calories (per serving)</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <div className="text-2xl">👥</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{servings}</div>
                  <div className="text-xs text-gray-600">Servings</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center">
                  <div className="text-2xl">🥘</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {recipe.ingredients.length}
                  </div>
                  <div className="text-xs text-gray-600">Ingredients</div>
                </div>
              </div>

              {/* Time breakdown */}
              <div className="mt-4 flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Prep:</span>
                  <span>{timeSplit.prep} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Cook:</span>
                  <span>{timeSplit.cook} min</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                className="flex min-h-[44px] items-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Recipe
              </button>
              <button
                onClick={() => handleShare(recipe)}
                className="flex min-h-[44px] items-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share Recipe
              </button>
              {onSwapRecipe && (
                <button
                  onClick={onSwapRecipe}
                  disabled={isSwapping}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-100 px-5 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSwapping ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Swapping...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Swap Recipe
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error message display */}
            {swapError && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-900">Unable to swap recipe</h4>
                    <p className="mt-1 text-sm text-red-700">{swapError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients section */}
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Ingredients</h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ri) => (
                  <div key={ri.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                      ✓
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{ri.ingredient.name}</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {ri.quantity} {ri.unit}
                      </span>
                    </div>
                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600">
                      {ri.ingredient.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions section */}
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Instructions</h3>
              <div className="space-y-4">
                {instructions.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="flex-1 pt-1 text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutritional information */}
            <div className="mb-8 rounded-lg bg-blue-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Nutritional Information</h3>
              <div className="text-sm text-gray-700">
                <p>Per serving: {recipe.calories} kcal</p>
                <p>Total for this meal: {recipe.calories * servings} kcal</p>
                <p className="mt-1 text-xs text-gray-600">
                  Note: Nutritional values are approximate and may vary based on specific
                  ingredients used.
                </p>
              </div>
            </div>

            {/* Additional info */}
            <div className="border-t border-gray-200 pt-6 text-sm text-gray-600">
              <p className="mb-2">
                <strong>Tips:</strong>
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Read through all instructions before starting</li>
                <li>Prep all ingredients before cooking</li>
                <li>Adjust seasoning to taste</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
