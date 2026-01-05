'use client';

import Image from 'next/image';
import {
  getRecipeTotalTime,
  getPrimaryImageUrl,
  type RecipeImage,
  type RecipeStep,
} from '@meal-planner-demo/types';
import { Printer, Share2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { calculateDifficulty, RECIPE_PLACEHOLDER_IMAGE } from '~/lib/recipeUtils';
import {
  type MealPlanRecipe,
  type MealPlanItem,
  getDifficultyVariant,
  getDifficultyLabel,
} from '~/types/meal-plan';

interface RecipeDetailModalProps {
  item: MealPlanItem;
  isOpen: boolean;
  onClose: () => void;
  onSwapRecipe?: () => void;
  isSwapping?: boolean;
  swapError?: string | null;
}

/**
 * Check if recipe has a diet tag
 */
function hasDietTag(recipe: MealPlanRecipe, tagName: string): boolean {
  if (recipe.dietTags) {
    return recipe.dietTags.some((dt) => dt.dietTag.name.toLowerCase() === tagName);
  }
  if (tagName === 'vegetarian') return recipe.isVegetarian;
  if (tagName === 'dairy-free') return recipe.isDairyFree;
  return false;
}

/**
 * Get time breakdown
 */
function getTimeSplit(recipe: MealPlanRecipe): {
  prep: number;
  cook: number;
  total: number;
} {
  const total = getRecipeTotalTime(recipe);

  if (recipe.prepTimeMinutes != null || recipe.cookTimeMinutes != null) {
    return {
      prep: recipe.prepTimeMinutes ?? 0,
      cook: recipe.cookTimeMinutes ?? 0,
      total,
    };
  }

  const prep = Math.floor(total * 0.3);
  return { prep, cook: total - prep, total };
}

/**
 * Get instructions from steps or parse markdown
 */
function getInstructions(recipe: MealPlanRecipe): string[] {
  if (recipe.steps && recipe.steps.length > 0) {
    return recipe.steps.sort((a, b) => a.stepNumber - b.stepNumber).map((step) => step.instruction);
  }

  if (!recipe.instructionsMd) return [];
  return parseInstructionsMd(recipe.instructionsMd);
}

/**
 * Parse markdown instructions
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

function handlePrint() {
  window.print();
}

async function handleShare(recipe: MealPlanRecipe) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: window.location.href,
      });
    } catch {
      await copyLink();
    }
  } else {
    await copyLink();
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Recipe link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy link:', error);
    toast.error('Failed to copy link to clipboard');
  }
}

export function RecipeDetailModal({
  item,
  isOpen,
  onClose,
  onSwapRecipe,
  isSwapping = false,
  swapError = null,
}: RecipeDetailModalProps) {
  const { recipe, mealType, servings } = item;

  const timeSplit = getTimeSplit(recipe);
  const totalTime = getRecipeTotalTime(recipe);
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

  const instructions = getInstructions(recipe);
  const imageUrl = getPrimaryImageUrl(
    recipe as { images?: RecipeImage[]; imageUrl?: string | null },
    RECIPE_PLACEHOLDER_IMAGE
  );
  const isVegetarian = hasDietTag(recipe, 'vegetarian');
  const isDairyFree = hasDietTag(recipe, 'dairy-free');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-56 w-full overflow-hidden bg-gray-200 sm:h-64">
          <Image
            src={imageUrl ?? RECIPE_PLACEHOLDER_IMAGE}
            alt={recipe.title}
            fill
            sizes="(min-width: 896px) 896px, 100vw"
            className="object-cover"
          />

          {/* Overlay badges */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Badge variant={difficultyVariant} className="text-sm px-3 py-1">
              {difficulty}
            </Badge>
            <Badge variant="mealType" className="text-sm px-3 py-1">
              {mealType}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="p-0 mb-6">
            <DialogTitle className="text-3xl font-bold text-gray-900">{recipe.title}</DialogTitle>

            {/* Dietary tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {isVegetarian && (
                <Badge variant="vegetarian" className="text-sm px-3 py-1">
                  🌱 Vegetarian
                </Badge>
              )}
              {isDairyFree && (
                <Badge variant="dairyFree" className="text-sm px-3 py-1">
                  🥛 Dairy-Free
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
            {[
              { emoji: '⏱️', value: `${timeSplit.total} min`, label: 'Total Time' },
              { emoji: '🔥', value: `${recipe.calories} kcal`, label: 'Calories' },
              { emoji: '👥', value: servings, label: 'Servings' },
              { emoji: '🥘', value: recipe.ingredients.length, label: 'Ingredients' },
            ].map((stat) => (
              <Card key={stat.label} className="p-3 text-center border-0 bg-gray-50">
                <div className="text-2xl">{stat.emoji}</div>
                <div className="mt-1 text-sm font-medium text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Time breakdown */}
          <div className="mb-6 flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">Prep:</span>
              <span>{timeSplit.prep} min</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Cook:</span>
              <span>{timeSplit.cook} min</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print Recipe
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleShare(recipe)}>
              <Share2 className="h-4 w-4" />
              Share Recipe
            </Button>
            {onSwapRecipe && (
              <Button variant="secondary" size="sm" onClick={onSwapRecipe} disabled={isSwapping}>
                <RefreshCw className={cn('h-4 w-4', isSwapping && 'animate-spin')} />
                {isSwapping ? 'Swapping...' : 'Swap Recipe'}
              </Button>
            )}
          </div>

          {/* Error message */}
          {swapError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to swap recipe</AlertTitle>
              <AlertDescription>{swapError}</AlertDescription>
            </Alert>
          )}

          {/* Ingredients section */}
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Ingredients
              {servings !== recipe.servingsDefault && recipe.servingsDefault > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (scaled for {servings} servings, original: {recipe.servingsDefault})
                </span>
              )}
            </h3>
            <div className="space-y-2">
              {recipe.ingredients.map((ri) => {
                // Scale ingredient quantity based on servings vs recipe default
                const scaleFactor =
                  recipe.servingsDefault > 0 ? servings / recipe.servingsDefault : 1;
                const scaledQuantity = Math.round(ri.quantity * scaleFactor * 10) / 10;
                return (
                  <div key={ri.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                      ✓
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{ri.ingredient.name}</span>
                      <span className="ml-2 text-sm text-gray-600">
                        {scaledQuantity} {ri.unit}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {ri.ingredient.category}
                    </Badge>
                  </div>
                );
              })}
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
          <Alert variant="info" className="mb-8">
            <AlertTitle>Nutritional Information</AlertTitle>
            <AlertDescription>
              <p>Per serving: {recipe.calories} kcal</p>
              <p>Total for this meal: {recipe.calories * servings} kcal</p>
              <p className="mt-1 text-xs opacity-75">
                Note: Nutritional values are approximate and may vary based on specific ingredients
                used.
              </p>
            </AlertDescription>
          </Alert>

          {/* Tips */}
          <div className="border-t border-gray-200 pt-6 text-sm text-gray-600">
            <p className="mb-2 font-semibold">Tips:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Read through all instructions before starting</li>
              <li>Prep all ingredients before cooking</li>
              <li>Adjust seasoning to taste</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RecipeDetailModal;
