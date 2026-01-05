'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getRecipeTotalTime, getPrimaryImageUrl, type RecipeImage } from '@meal-planner-demo/types';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { calculateDifficulty, RECIPE_PLACEHOLDER_IMAGE } from '~/lib/recipeUtils';
import {
  type MealPlanRecipe,
  type MealPlanItem,
  getDifficultyVariant,
  getDifficultyLabel,
} from '~/types/meal-plan';

interface RecipeCardProps {
  item: MealPlanItem;
  onOpenDetail: (item: MealPlanItem) => void;
}

/**
 * Get top 3 ingredients for preview
 */
function getIngredientPreview(ingredients: MealPlanRecipe['ingredients']): string {
  const topIngredients = ingredients
    .slice(0, 3)
    .map((ri) => ri.ingredient.name)
    .join(', ');

  return ingredients.length > 3 ? `${topIngredients}...` : topIngredients;
}

/**
 * Check if recipe has a diet tag
 */
function hasDietTag(recipe: MealPlanRecipe, tagName: string): boolean {
  if (recipe.dietTags) {
    return recipe.dietTags.some((dt) => dt.dietTag.name.toLowerCase() === tagName);
  }
  // Fallback to deprecated fields
  if (tagName === 'vegetarian') return recipe.isVegetarian ?? false;
  if (tagName === 'dairy-free') return recipe.isDairyFree ?? false;
  return false;
}

/**
 * Get additional diet tags beyond vegetarian/dairy-free
 */
function getDisplayDietTags(recipe: MealPlanRecipe): string[] {
  if (!recipe.dietTags) return [];
  return recipe.dietTags
    .map((dt) => dt.dietTag.name)
    .filter((name) => !['vegetarian', 'dairy-free'].includes(name.toLowerCase()));
}

/**
 * Get allergen tags for display
 */
function getAllergenTags(recipe: MealPlanRecipe): string[] {
  if (!recipe.allergenTags) return [];
  return recipe.allergenTags.map((at) => at.allergenTag.name);
}

/**
 * Format time display with prep/cook breakdown
 */
function formatTimeDisplay(recipe: MealPlanRecipe): {
  total: number;
  breakdown: string | null;
} {
  const total = getRecipeTotalTime(recipe);
  const prep = recipe.prepTimeMinutes;
  const cook = recipe.cookTimeMinutes;

  if (prep && cook) {
    return { total, breakdown: `${prep}m prep + ${cook}m cook` };
  }
  return { total, breakdown: null };
}

export function RecipeCard({ item, onOpenDetail }: RecipeCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { recipe, mealType, servings } = item;

  const timeInfo = formatTimeDisplay(recipe);
  const totalTime = getRecipeTotalTime(recipe);

  // Use database difficulty if available, otherwise calculate
  const difficulty = recipe.difficulty
    ? getDifficultyLabel(recipe.difficulty)
    : calculateDifficulty(totalTime, recipe.ingredients.length);

  const difficultyVariant = recipe.difficulty
    ? getDifficultyVariant(recipe.difficulty)
    : difficulty === 'Easy'
      ? 'easy'
      : difficulty === 'Medium'
        ? 'medium'
        : 'hard';

  const ingredientPreview = getIngredientPreview(recipe.ingredients);
  const imageUrl = getPrimaryImageUrl(
    recipe as { images?: RecipeImage[]; imageUrl?: string | null },
    RECIPE_PLACEHOLDER_IMAGE
  );

  // Reset error state when recipe image changes
  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const isVegetarian = hasDietTag(recipe, 'vegetarian');
  const isDairyFree = hasDietTag(recipe, 'dairy-free');
  const otherDietTags = getDisplayDietTags(recipe);
  const allergenTags = getAllergenTags(recipe);

  return (
    <Card
      asChild
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-emerald-400"
    >
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onOpenDetail(item)}
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        aria-label={`View details for ${recipe.title}`}
      >
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
          {/* Recipe image */}
          <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-gray-200 sm:h-40 sm:w-40 sm:flex-shrink-0 sm:rounded-lg">
            <Image
              src={imgError ? RECIPE_PLACEHOLDER_IMAGE : (imageUrl ?? RECIPE_PLACEHOLDER_IMAGE)}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => {
                if (!imgError) setImgError(true);
              }}
            />

            {/* Difficulty badge on image */}
            <div className="absolute right-2 top-2">
              <Badge variant={difficultyVariant}>{difficulty}</Badge>
            </div>
          </div>

          {/* Recipe details */}
          <div className="flex flex-1 flex-col">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Meal type badge */}
                <Badge variant="mealType">{mealType}</Badge>

                {/* Dietary tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {isVegetarian && <Badge variant="vegetarian">🌱 Vegetarian</Badge>}
                  {isDairyFree && <Badge variant="dairyFree">🥛 Dairy-Free</Badge>}
                  {otherDietTags.slice(0, 2).map((tag) => (
                    <Badge key={tag} className="bg-purple-50 text-purple-700 capitalize">
                      {tag}
                    </Badge>
                  ))}
                  {allergenTags.length > 0 && (
                    <Badge className="bg-amber-50 text-amber-700">
                      ⚠️ Contains: {allergenTags.slice(0, 2).join(', ')}
                      {allergenTags.length > 2 && ` +${allergenTags.length - 2}`}
                    </Badge>
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
                    <span className="ml-1 hidden text-xs text-gray-400 sm:inline">
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
              className={cn(
                'mt-3 text-sm text-emerald-600 transition-opacity duration-200',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
            >
              View full recipe details →
            </div>
          </div>
        </div>
      </button>
    </Card>
  );
}

export default RecipeCard;
