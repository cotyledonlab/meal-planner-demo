/**
 * Shared utilities for recipe-related calculations and formatting
 */

// Constants for difficulty calculation
const DIFFICULTY_EASY_THRESHOLD = 40;
const DIFFICULTY_MEDIUM_THRESHOLD = 70;
const INGREDIENT_WEIGHT_FACTOR = 2;

/**
 * Placeholder image URL for recipes without images
 * Using Unsplash food image as fallback
 */
export const RECIPE_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=80';

/**
 * Calculate difficulty level based on recipe time and number of ingredients
 *
 * @param minutes - Total cooking time in minutes
 * @param ingredientCount - Number of ingredients in the recipe
 * @returns Difficulty level (Easy/Medium/Hard)
 */
export function calculateDifficulty(
  minutes: number,
  ingredientCount: number
): 'Easy' | 'Medium' | 'Hard' {
  const score = minutes + ingredientCount * INGREDIENT_WEIGHT_FACTOR;

  if (score < DIFFICULTY_EASY_THRESHOLD) return 'Easy';
  if (score < DIFFICULTY_MEDIUM_THRESHOLD) return 'Medium';
  return 'Hard';
}

/**
 * Get Tailwind CSS classes for difficulty badge styling
 *
 * @param difficulty - Difficulty level
 * @returns CSS classes string for the badge
 */
export function getDifficultyColor(difficulty: 'Easy' | 'Medium' | 'Hard'): string {
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
