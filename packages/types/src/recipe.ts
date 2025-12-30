/**
 * Recipe Domain Types
 *
 * TypeScript interfaces mirroring the normalized recipe schema.
 * These types are used across the application for type safety.
 */

// Enums matching Prisma schema
export type RecipeStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export type RecipeDifficulty = "EASY" | "MEDIUM" | "HARD";

export type StepType = "PREP" | "COOK" | "REST" | "ASSEMBLE";

export type MealType = "breakfast" | "lunch" | "dinner";

// Core domain interfaces

export interface RecipeStep {
  id: string;
  recipeId: string;
  stepNumber: number;
  stepType: StepType;
  instruction: string;
  durationMinutes: number | null;
  tips: string | null;
  imageUrl: string | null;
}

export interface RecipeNutrition {
  id: string;
  recipeId: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  cholesterol: number | null;
  saturatedFat: number | null;
}

export interface DietTag {
  id: string;
  name: string;
  description: string | null;
}

export interface AllergenTag {
  id: string;
  name: string;
  description: string | null;
  severity: string | null;
}

export interface RecipeImage {
  id: string;
  recipeId: string;
  url: string;
  prompt: string | null;
  model: string | null;
  isPrimary: boolean;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  mimeType: string | null;
  altText: string | null;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  ingredient: Ingredient;
}

// Full recipe with all relations
export interface Recipe {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  mealTypes: MealType[];
  servingsDefault: number;

  // Time fields
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  totalTimeMinutes: number | null;
  minutes: number; // deprecated

  // Nutrition (basic)
  calories: number;

  // Status & workflow
  status: RecipeStatus;
  difficulty: RecipeDifficulty;
  publishedAt: Date | null;

  // Source attribution
  sourceUrl: string | null;
  sourceAttribution: string | null;

  // Legacy fields (deprecated)
  isVegetarian: boolean;
  isDairyFree: boolean;
  instructionsMd: string;
  imageUrl: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Recipe with all normalized relations included
export interface RecipeWithRelations extends Recipe {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition: RecipeNutrition | null;
  images: RecipeImage[];
  dietTags: Array<{ dietTag: DietTag }>;
  allergenTags: Array<{ allergenTag: AllergenTag }>;
}

// Recipe for plan generation (subset of fields needed)
export interface RecipeForPlanning {
  id: string;
  title: string;
  mealTypes: MealType[];
  servingsDefault: number;
  calories: number;
  isVegetarian: boolean;
  isDairyFree: boolean;
  ingredients: Array<{
    ingredient: {
      id: string;
      name: string;
      category: string;
    };
    quantity: number;
    unit: string;
  }>;
}

// Input types for creating/updating recipes

export interface CreateRecipeStepInput {
  stepNumber: number;
  stepType: StepType;
  instruction: string;
  durationMinutes?: number | null;
  tips?: string | null;
  imageUrl?: string | null;
}

export interface CreateRecipeNutritionInput {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  cholesterol?: number | null;
  saturatedFat?: number | null;
}

export interface CreateRecipeIngredientInput {
  ingredientId: string;
  quantity: number;
  unit: string;
}

export interface CreateRecipeImageInput {
  url: string;
  prompt?: string | null;
  model?: string | null;
  isPrimary?: boolean;
  width?: number | null;
  height?: number | null;
  fileSize?: number | null;
  mimeType?: string | null;
  altText?: string | null;
}

export interface CreateRecipeInput {
  title: string;
  slug?: string | null;
  description?: string | null;
  mealTypes: MealType[];
  servingsDefault?: number;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  totalTimeMinutes?: number | null;
  calories: number;
  status?: RecipeStatus;
  difficulty?: RecipeDifficulty;
  sourceUrl?: string | null;
  sourceAttribution?: string | null;

  // Legacy fields (for backward compatibility during migration)
  isVegetarian?: boolean;
  isDairyFree?: boolean;
  instructionsMd?: string;
  imageUrl?: string | null;

  // Relations
  steps?: CreateRecipeStepInput[];
  nutrition?: CreateRecipeNutritionInput | null;
  ingredients?: CreateRecipeIngredientInput[];
  images?: CreateRecipeImageInput[];
  dietTagIds?: string[];
  allergenTagIds?: string[];
}

// Filter options for querying recipes
export interface RecipeFilters {
  status?: RecipeStatus;
  isVegetarian?: boolean;
  isDairyFree?: boolean;
  mealTypes?: MealType[];
  dietTagIds?: string[];
  excludeAllergenTagIds?: string[];
  excludeIngredientNames?: string[];
  difficulty?: RecipeDifficulty;
  maxPrepTime?: number;
  maxCookTime?: number;
  maxTotalTime?: number;
}

// Canonical diet and allergen tag names
export const DIET_TAGS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "keto",
  "paleo",
  "low-carb",
  "gluten-free",
  "dairy-free",
  "halal",
  "kosher",
] as const;

export type DietTagName = (typeof DIET_TAGS)[number];

export const ALLERGEN_TAGS = [
  "gluten",
  "dairy",
  "eggs",
  "nuts",
  "peanuts",
  "soy",
  "shellfish",
  "fish",
  "sesame",
  "mustard",
  "celery",
  "sulphites",
] as const;

export type AllergenTagName = (typeof ALLERGEN_TAGS)[number];
