import { describe, it, expect } from 'vitest';
import {
  deriveIngredientAllergens,
  deriveIngredientDietFlags,
  deriveRecipeTags,
  recipeContainsAllergen,
  recipeIsSafeForDiet,
  type IngredientWithCanonical,
} from './derivation';

describe('deriveIngredientAllergens', () => {
  it('returns empty array for null canonical data', () => {
    expect(deriveIngredientAllergens(null)).toEqual([]);
    expect(deriveIngredientAllergens(undefined)).toEqual([]);
  });

  it('returns empty array when no allergen flags are true', () => {
    const canonical = {
      containsGluten: false,
      containsDairy: false,
      containsEggs: false,
    };
    expect(deriveIngredientAllergens(canonical)).toEqual([]);
  });

  it('returns correct allergen tags for flagged ingredients', () => {
    const canonical = {
      containsGluten: true,
      containsDairy: true,
      containsEggs: false,
    };
    const allergens = deriveIngredientAllergens(canonical);
    expect(allergens).toContain('gluten');
    expect(allergens).toContain('dairy');
    expect(allergens).not.toContain('eggs');
  });

  it('handles all allergen types', () => {
    const canonical = {
      containsGluten: true,
      containsDairy: true,
      containsEggs: true,
      containsNuts: true,
      containsPeanuts: true,
      containsSoy: true,
      containsShellfish: true,
      containsFish: true,
      containsSesame: true,
    };
    const allergens = deriveIngredientAllergens(canonical);
    expect(allergens).toHaveLength(9);
    expect(allergens).toContain('gluten');
    expect(allergens).toContain('dairy');
    expect(allergens).toContain('eggs');
    expect(allergens).toContain('nuts');
    expect(allergens).toContain('peanuts');
    expect(allergens).toContain('soy');
    expect(allergens).toContain('shellfish');
    expect(allergens).toContain('fish');
    expect(allergens).toContain('sesame');
  });
});

describe('deriveIngredientDietFlags', () => {
  it('returns restrictive defaults for null canonical data', () => {
    const flags = deriveIngredientDietFlags(null);
    expect(flags.isVegan).toBe(false);
    expect(flags.isVegetarian).toBe(false);
    expect(flags.isGlutenFree).toBe(true);
    expect(flags.isDairyFree).toBe(true);
  });

  it('returns correct flags for vegan ingredient', () => {
    const canonical = {
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
    };
    const flags = deriveIngredientDietFlags(canonical);
    expect(flags.isVegan).toBe(true);
    expect(flags.isVegetarian).toBe(true);
    expect(flags.isGlutenFree).toBe(true);
    expect(flags.isDairyFree).toBe(true);
  });

  it('returns correct flags for dairy ingredient', () => {
    const canonical = {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: false,
    };
    const flags = deriveIngredientDietFlags(canonical);
    expect(flags.isVegan).toBe(false);
    expect(flags.isVegetarian).toBe(true);
    expect(flags.isDairyFree).toBe(false);
  });

  it('handles missing flags with defaults', () => {
    const canonical = {
      isVegan: true,
      // isVegetarian not specified
    };
    const flags = deriveIngredientDietFlags(canonical);
    expect(flags.isVegan).toBe(true);
    expect(flags.isVegetarian).toBe(false); // defaults to false
    expect(flags.isGlutenFree).toBe(true); // defaults to true
    expect(flags.isDairyFree).toBe(true); // defaults to true
  });
});

describe('deriveRecipeTags', () => {
  const veganIngredient: IngredientWithCanonical = {
    name: 'spinach',
    canonicalIngredient: {
      name: 'spinach',
      category: 'vegetables',
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
    },
  };

  const dairyIngredient: IngredientWithCanonical = {
    name: 'cheese',
    canonicalIngredient: {
      name: 'cheese',
      category: 'dairy',
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: false,
      containsDairy: true,
    },
  };

  const meatIngredient: IngredientWithCanonical = {
    name: 'chicken',
    canonicalIngredient: {
      name: 'chicken breast',
      category: 'protein',
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: true,
      isDairyFree: true,
    },
  };

  const glutenIngredient: IngredientWithCanonical = {
    name: 'pasta',
    canonicalIngredient: {
      name: 'pasta',
      category: 'grains',
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      containsGluten: true,
    },
  };

  it('returns empty tags for empty ingredients', () => {
    const result = deriveRecipeTags([]);
    expect(result.dietTags).toEqual([]);
    expect(result.allergenTags).toEqual([]);
    expect(result.isVegan).toBe(false);
    expect(result.isVegetarian).toBe(false);
  });

  it('correctly derives tags for all-vegan recipe', () => {
    const result = deriveRecipeTags([veganIngredient, veganIngredient]);
    expect(result.dietTags).toContain('vegan');
    expect(result.dietTags).toContain('vegetarian');
    expect(result.dietTags).toContain('gluten-free');
    expect(result.dietTags).toContain('dairy-free');
    expect(result.isVegan).toBe(true);
    expect(result.isVegetarian).toBe(true);
    expect(result.allergenTags).toHaveLength(0);
  });

  it('correctly derives tags for vegetarian but not vegan recipe', () => {
    const result = deriveRecipeTags([veganIngredient, dairyIngredient]);
    expect(result.dietTags).toContain('vegetarian');
    expect(result.dietTags).not.toContain('vegan');
    expect(result.dietTags).not.toContain('dairy-free');
    expect(result.isVegan).toBe(false);
    expect(result.isVegetarian).toBe(true);
    expect(result.allergenTags).toContain('dairy');
  });

  it('correctly derives tags for non-vegetarian recipe', () => {
    const result = deriveRecipeTags([veganIngredient, meatIngredient]);
    expect(result.dietTags).not.toContain('vegetarian');
    expect(result.dietTags).not.toContain('vegan');
    expect(result.dietTags).toContain('gluten-free');
    expect(result.dietTags).toContain('dairy-free');
    expect(result.isVegan).toBe(false);
    expect(result.isVegetarian).toBe(false);
  });

  it('correctly derives gluten allergen', () => {
    const result = deriveRecipeTags([veganIngredient, glutenIngredient]);
    expect(result.allergenTags).toContain('gluten');
    expect(result.dietTags).not.toContain('gluten-free');
    expect(result.isGlutenFree).toBe(false);
  });

  it('handles ingredients without canonical data conservatively', () => {
    const unknownIngredient: IngredientWithCanonical = {
      name: 'mystery ingredient',
      canonicalIngredient: null,
    };
    const result = deriveRecipeTags([veganIngredient, unknownIngredient]);
    // With unknown ingredient, we're conservative
    expect(result.isVegan).toBe(false);
    expect(result.isVegetarian).toBe(false);
  });

  it('aggregates multiple allergens from multiple ingredients', () => {
    const eggIngredient: IngredientWithCanonical = {
      name: 'eggs',
      canonicalIngredient: {
        name: 'eggs',
        category: 'protein',
        isVegan: false,
        isVegetarian: true,
        containsEggs: true,
      },
    };
    const result = deriveRecipeTags([dairyIngredient, eggIngredient, glutenIngredient]);
    expect(result.allergenTags).toContain('dairy');
    expect(result.allergenTags).toContain('eggs');
    expect(result.allergenTags).toContain('gluten');
    expect(result.allergenTags).toHaveLength(3);
  });
});

describe('recipeContainsAllergen', () => {
  const dairyIngredient: IngredientWithCanonical = {
    name: 'milk',
    canonicalIngredient: {
      name: 'milk',
      category: 'dairy',
      containsDairy: true,
    },
  };

  const veganIngredient: IngredientWithCanonical = {
    name: 'spinach',
    canonicalIngredient: {
      name: 'spinach',
      category: 'vegetables',
    },
  };

  it('returns true when recipe contains the allergen', () => {
    expect(recipeContainsAllergen([veganIngredient, dairyIngredient], 'dairy')).toBe(true);
  });

  it('returns false when recipe does not contain the allergen', () => {
    expect(recipeContainsAllergen([veganIngredient], 'dairy')).toBe(false);
  });

  it('returns false for empty ingredients', () => {
    expect(recipeContainsAllergen([], 'dairy')).toBe(false);
  });
});

describe('recipeIsSafeForDiet', () => {
  const veganIngredient: IngredientWithCanonical = {
    name: 'tofu',
    canonicalIngredient: {
      name: 'tofu',
      category: 'protein',
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
    },
  };

  const dairyIngredient: IngredientWithCanonical = {
    name: 'cheese',
    canonicalIngredient: {
      name: 'cheese',
      category: 'dairy',
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: false,
    },
  };

  it('returns true for vegan recipe and vegan diet', () => {
    expect(recipeIsSafeForDiet([veganIngredient], 'vegan')).toBe(true);
  });

  it('returns false for non-vegan recipe and vegan diet', () => {
    expect(recipeIsSafeForDiet([veganIngredient, dairyIngredient], 'vegan')).toBe(false);
  });

  it('returns true for vegetarian recipe and vegetarian diet', () => {
    expect(recipeIsSafeForDiet([veganIngredient, dairyIngredient], 'vegetarian')).toBe(true);
  });

  it('returns true for gluten-free recipe and gluten-free diet', () => {
    expect(recipeIsSafeForDiet([veganIngredient, dairyIngredient], 'gluten-free')).toBe(true);
  });

  it('returns false for dairy recipe and dairy-free diet', () => {
    expect(recipeIsSafeForDiet([dairyIngredient], 'dairy-free')).toBe(false);
  });
});
