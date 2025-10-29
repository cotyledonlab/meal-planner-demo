'use client';

import Image from 'next/image';
import { useState } from 'react';

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

interface RecipeCardProps {
  item: MealPlanItem;
  onOpenDetail: (item: MealPlanItem) => void;
}

/**
 * Calculate difficulty level based on recipe time and number of ingredients
 */
function calculateDifficulty(minutes: number, ingredientCount: number): 'Easy' | 'Medium' | 'Hard' {
  const score = minutes + ingredientCount * 2;
  
  if (score < 40) return 'Easy';
  if (score < 70) return 'Medium';
  return 'Hard';
}

/**
 * Get difficulty badge color classes
 */
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get top 3 ingredients for preview
 */
function getIngredientPreview(ingredients: RecipeIngredient[]): string {
  const topIngredients = ingredients
    .slice(0, 3)
    .map(ri => ri.ingredient.name)
    .join(', ');
  
  return ingredients.length > 3 ? `${topIngredients}...` : topIngredients;
}

export default function RecipeCard({ item, onOpenDetail }: RecipeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { recipe, mealType, servings } = item;
  
  const difficulty = calculateDifficulty(recipe.minutes, recipe.ingredients.length);
  const ingredientPreview = getIngredientPreview(recipe.ingredients);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-gray-200 transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-emerald-400"
      onClick={() => onOpenDetail(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-4 p-4">
        {/* Recipe image - larger and more prominent */}
        <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
          <Image
            src={recipe.imageUrl ?? '/placeholder-recipe.jpg'}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Difficulty badge on image */}
          <div className="absolute right-2 top-2">
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
        </div>

        {/* Recipe details */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Meal type badge with improved styling */}
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {mealType}
              </span>
              
              {/* Dietary tags */}
              <div className="mt-2 flex flex-wrap gap-1">
                {recipe.isVegetarian && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    🌱 Vegetarian
                  </span>
                )}
                {recipe.isDairyFree && (
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
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{recipe.minutes} min</span>
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
          {isHovered && (
            <div className="mt-2 text-sm text-emerald-600">
              Click to view full recipe details →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
