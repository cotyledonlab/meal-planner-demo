/**
 * Ingredient Derivation Service
 *
 * Provides deterministic helpers that compute allergen and dietary tags
 * from canonical ingredient data. Used by seed scripts, backfill jobs,
 * and recipe creation to ensure consistent tagging.
 */

import type { AllergenTagName, DietTagName } from '@meal-planner-demo/types';

/**
 * Allergen flags present on canonical ingredients
 */
export interface CanonicalAllergenFlags {
  containsGluten?: boolean;
  containsDairy?: boolean;
  containsEggs?: boolean;
  containsNuts?: boolean;
  containsPeanuts?: boolean;
  containsSoy?: boolean;
  containsShellfish?: boolean;
  containsFish?: boolean;
  containsSesame?: boolean;
}

/**
 * Dietary flags present on canonical ingredients
 */
export interface CanonicalDietFlags {
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
}

/**
 * Full canonical ingredient data for derivation
 */
export interface CanonicalIngredientData extends CanonicalAllergenFlags, CanonicalDietFlags {
  name: string;
  category: string;
}

/**
 * Recipe ingredient with linked canonical data
 */
export interface IngredientWithCanonical {
  name: string;
  canonicalIngredient?: CanonicalIngredientData | null;
}

/**
 * Derived tags result
 */
export interface DerivedTags {
  dietTags: DietTagName[];
  allergenTags: AllergenTagName[];
  isVegetarian: boolean;
  isVegan: boolean;
  isDairyFree: boolean;
  isGlutenFree: boolean;
}

/**
 * Map of canonical ingredient allergen flags to allergen tag names
 */
const ALLERGEN_FLAG_TO_TAG: Record<keyof CanonicalAllergenFlags, AllergenTagName> = {
  containsGluten: 'gluten',
  containsDairy: 'dairy',
  containsEggs: 'eggs',
  containsNuts: 'nuts',
  containsPeanuts: 'peanuts',
  containsSoy: 'soy',
  containsShellfish: 'shellfish',
  containsFish: 'fish',
  containsSesame: 'sesame',
};

/**
 * Derive allergen tags from a single canonical ingredient.
 * Returns list of allergen tag names that apply to this ingredient.
 */
export function deriveIngredientAllergens(
  canonical: CanonicalAllergenFlags | null | undefined
): AllergenTagName[] {
  if (!canonical) return [];

  const allergens: AllergenTagName[] = [];

  for (const [flag, tagName] of Object.entries(ALLERGEN_FLAG_TO_TAG)) {
    if (canonical[flag as keyof CanonicalAllergenFlags] === true) {
      allergens.push(tagName);
    }
  }

  return allergens;
}

/**
 * Derive dietary flags from a single canonical ingredient.
 * Returns object with vegan, vegetarian, gluten-free, dairy-free flags.
 */
export function deriveIngredientDietFlags(canonical: CanonicalDietFlags | null | undefined): {
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
} {
  if (!canonical) {
    // Default to most restrictive (non-vegan, non-vegetarian) if unknown
    return {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: true, // Assume gluten-free unless flagged
      isDairyFree: true, // Assume dairy-free unless flagged
    };
  }

  return {
    isVegan: canonical.isVegan ?? false,
    isVegetarian: canonical.isVegetarian ?? false,
    isGlutenFree: canonical.isGlutenFree ?? true,
    isDairyFree: canonical.isDairyFree ?? true,
  };
}

/**
 * Derive recipe-level tags from all ingredients.
 *
 * Allergen logic: Recipe has allergen if ANY ingredient has it.
 * Diet logic: Recipe is vegetarian/vegan only if ALL ingredients are.
 *
 * @param ingredients - Array of recipe ingredients with canonical data
 * @returns Derived diet tags, allergen tags, and boolean flags
 */
export function deriveRecipeTags(ingredients: IngredientWithCanonical[]): DerivedTags {
  // Collect all allergens from all ingredients
  const allergenSet = new Set<AllergenTagName>();

  // Track dietary compliance across all ingredients
  let allVegan = true;
  let allVegetarian = true;
  let allGlutenFree = true;
  let allDairyFree = true;

  // Track if we have any canonical data at all
  let hasAnyCanonicalData = false;

  for (const ingredient of ingredients) {
    const canonical = ingredient.canonicalIngredient;

    // Derive allergens for this ingredient
    const ingredientAllergens = deriveIngredientAllergens(canonical);
    for (const allergen of ingredientAllergens) {
      allergenSet.add(allergen);
    }

    // Derive diet flags for this ingredient
    const dietFlags = deriveIngredientDietFlags(canonical);

    if (canonical) {
      hasAnyCanonicalData = true;
    }

    // Recipe is only vegan/vegetarian if ALL ingredients are
    if (!dietFlags.isVegan) allVegan = false;
    if (!dietFlags.isVegetarian) allVegetarian = false;
    if (!dietFlags.isGlutenFree) allGlutenFree = false;
    if (!dietFlags.isDairyFree) allDairyFree = false;
  }

  // If no ingredients or no canonical data, be conservative
  if (ingredients.length === 0 || !hasAnyCanonicalData) {
    allVegan = false;
    allVegetarian = false;
    allGlutenFree = false;
    allDairyFree = false;
  }

  // Build diet tags list
  const dietTags: DietTagName[] = [];

  if (allVegan) {
    dietTags.push('vegan');
    dietTags.push('vegetarian'); // Vegan implies vegetarian
  } else if (allVegetarian) {
    dietTags.push('vegetarian');
  }

  if (allGlutenFree) {
    dietTags.push('gluten-free');
  }

  if (allDairyFree) {
    dietTags.push('dairy-free');
  }

  return {
    dietTags,
    allergenTags: Array.from(allergenSet),
    isVegetarian: allVegetarian,
    isVegan: allVegan,
    isDairyFree: allDairyFree,
    isGlutenFree: allGlutenFree,
  };
}

/**
 * Check if a recipe contains a specific allergen based on its ingredients.
 */
export function recipeContainsAllergen(
  ingredients: IngredientWithCanonical[],
  allergen: AllergenTagName
): boolean {
  for (const ingredient of ingredients) {
    const allergens = deriveIngredientAllergens(ingredient.canonicalIngredient);
    if (allergens.includes(allergen)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a recipe is safe for a specific dietary requirement.
 */
export function recipeIsSafeForDiet(
  ingredients: IngredientWithCanonical[],
  diet: 'vegan' | 'vegetarian' | 'gluten-free' | 'dairy-free'
): boolean {
  const derived = deriveRecipeTags(ingredients);

  switch (diet) {
    case 'vegan':
      return derived.isVegan;
    case 'vegetarian':
      return derived.isVegetarian;
    case 'gluten-free':
      return derived.isGlutenFree;
    case 'dairy-free':
      return derived.isDairyFree;
    default:
      return false;
  }
}
