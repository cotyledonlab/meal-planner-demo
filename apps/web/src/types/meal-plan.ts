/**
 * Consolidated Meal Plan Types
 *
 * This file re-exports canonical types from @meal-planner-demo/types
 * and defines app-specific types for the web frontend.
 */

// Re-export canonical types from shared package
export type {
  Recipe,
  RecipeWithRelations,
  RecipeIngredient,
  RecipeImage,
  RecipeStep,
  RecipeNutrition,
  RecipeDifficulty,
  RecipeStatus,
  MealType,
  StepType,
  DietTag,
  AllergenTag,
  Ingredient,
  RecipeFilters,
  RecipeForPlanning,
} from "@meal-planner-demo/types";

export {
  getRecipeTotalTime,
  getPrimaryImageUrl,
  DIET_TAGS,
  ALLERGEN_TAGS,
} from "@meal-planner-demo/types";

export type {
  DietTagName,
  AllergenTagName,
} from "@meal-planner-demo/types";

// App-specific types

/**
 * User preferences for generating a meal plan
 */
export interface MealPreferences {
  householdSize: number;
  mealsPerDay: number;
  days: number;
  isVegetarian: boolean;
  isDairyFree: boolean;
  dislikes: string;
  // Advanced filters
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  maxTotalTime?: number | null;
  excludeAllergens?: string[];
}

/**
 * Allergen option for the meal wizard
 */
export interface AllergenOption {
  id: string;
  label: string;
  emoji: string;
}

/**
 * Cooking time option for the meal wizard
 */
export interface MaxTimeOption {
  value: number | null;
  label: string;
}

/**
 * Constants for allergen options in the wizard
 */
export const ALLERGEN_OPTIONS: readonly AllergenOption[] = [
  { id: "gluten", label: "Gluten", emoji: "🌾" },
  { id: "dairy", label: "Dairy", emoji: "🧀" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "nuts", label: "Tree Nuts", emoji: "🥜" },
  { id: "peanuts", label: "Peanuts", emoji: "🥜" },
  { id: "soy", label: "Soy", emoji: "🫘" },
  { id: "shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "fish", label: "Fish", emoji: "🐟" },
  { id: "sesame", label: "Sesame", emoji: "🌱" },
] as const;

/**
 * Constants for max cooking time options
 */
export const MAX_TIME_OPTIONS: readonly MaxTimeOption[] = [
  { value: null, label: "Any time" },
  { value: 15, label: "15 minutes or less" },
  { value: 30, label: "30 minutes or less" },
  { value: 45, label: "45 minutes or less" },
  { value: 60, label: "1 hour or less" },
  { value: 90, label: "90 minutes or less" },
] as const;

/**
 * Diet tag relation from API response
 */
export interface DietTagRelation {
  dietTag: {
    id: string;
    name: string;
    description?: string | null;
  };
}

/**
 * Allergen tag relation from API response
 */
export interface AllergenTagRelation {
  allergenTag: {
    id: string;
    name: string;
    description?: string | null;
    severity?: string | null;
  };
}

/**
 * Recipe ingredient with full ingredient details
 */
export interface RecipeIngredientWithDetails {
  id: string;
  quantity: number;
  unit: string;
  ingredient: {
    id: string;
    name: string;
    category: string;
  };
}

/**
 * Recipe type used in meal plan views
 * Compatible with both legacy and new normalized schema
 */
export interface MealPlanRecipe {
  id: string;
  title: string;
  imageUrl: string | null;
  calories: number;
  /** @deprecated Use totalTimeMinutes or prepTimeMinutes + cookTimeMinutes */
  minutes: number | null;
  /** @deprecated Use steps relation instead */
  instructionsMd: string | null;
  /** @deprecated Use dietTags relation instead */
  isVegetarian: boolean;
  /** @deprecated Use allergenTags relation instead */
  isDairyFree: boolean;
  ingredients: RecipeIngredientWithDetails[];
  // New normalized fields (optional for backward compatibility)
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  totalTimeMinutes?: number | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  dietTags?: DietTagRelation[];
  allergenTags?: AllergenTagRelation[];
  images?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    altText?: string | null;
  }>;
  steps?: Array<{
    id: string;
    stepNumber: number;
    instruction: string;
    durationMinutes?: number | null;
    tips?: string | null;
  }>;
}

/**
 * A single item in a meal plan
 */
export interface MealPlanItem {
  id: string;
  dayIndex: number;
  mealType: string;
  servings: number;
  recipe: MealPlanRecipe;
}

/**
 * Complete meal plan with items
 */
export interface MealPlan {
  id: string;
  startDate: Date | string;
  days: number;
  items: MealPlanItem[];
}

/**
 * Shopping list item
 */
export interface ShoppingListItem {
  id: string;
  ingredient: {
    id: string;
    name: string;
    category: string;
  };
  quantity: number;
  unit: string;
  isChecked: boolean;
}

/**
 * Shopping list grouped by category
 */
export interface ShoppingListCategory {
  category: string;
  emoji: string;
  items: ShoppingListItem[];
}

/**
 * Helper to get recipe display time
 */
export function getDisplayTime(recipe: {
  totalTimeMinutes?: number | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  minutes?: number | null;
}): number {
  if (recipe.totalTimeMinutes != null) {
    return recipe.totalTimeMinutes;
  }
  if (recipe.prepTimeMinutes != null || recipe.cookTimeMinutes != null) {
    return (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  }
  return recipe.minutes ?? 0;
}

/**
 * Format minutes into a human-readable string
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Get difficulty badge variant
 */
export function getDifficultyVariant(
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null
): "easy" | "medium" | "hard" {
  switch (difficulty) {
    case "EASY":
      return "easy";
    case "MEDIUM":
      return "medium";
    case "HARD":
      return "hard";
    default:
      return "easy";
  }
}

/**
 * Get difficulty display label
 */
export function getDifficultyLabel(
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null
): string {
  switch (difficulty) {
    case "EASY":
      return "Easy";
    case "MEDIUM":
      return "Medium";
    case "HARD":
      return "Hard";
    default:
      return "Easy";
  }
}
