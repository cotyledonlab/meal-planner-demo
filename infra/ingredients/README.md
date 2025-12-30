# Canonical Ingredients Dictionary

This directory contains the canonical ingredient dictionary used by the meal planner application to provide consistent allergen and dietary metadata across all ingredients.

## Overview

The canonical ingredient system provides:

- **Standardized ingredient names** with consistent spelling and formatting
- **Allergen metadata** (gluten, dairy, eggs, nuts, fish, etc.)
- **Dietary flags** (vegan, vegetarian, gluten-free, dairy-free)
- **Alias mapping** so variations like "chicken", "chicken breast", "boneless chicken" all map to the same canonical entry

## Files

- `canonical-ingredients.json` - The main dictionary containing all canonical ingredients and their metadata

## Structure

Each canonical ingredient has the following properties:

```json
{
  "name": "chicken breast", // Canonical name (required)
  "category": "protein", // Primary category (required)
  "subcategory": "poultry", // Optional subcategory
  "description": "...", // Optional description

  // Dietary flags (all default to false except noted)
  "isVegan": false,
  "isVegetarian": false,
  "isGlutenFree": true, // Defaults to true
  "isDairyFree": true, // Defaults to true

  // Allergen flags (all default to false)
  "containsGluten": false,
  "containsDairy": false,
  "containsEggs": false,
  "containsNuts": false,
  "containsPeanuts": false,
  "containsSoy": false,
  "containsShellfish": false,
  "containsFish": false,
  "containsSesame": false,

  // Alias names that map to this ingredient
  "aliases": ["chicken", "boneless chicken", "chicken fillet"]
}
```

## Categories

Valid categories are:

- `protein` - Meat, fish, eggs, legumes, tofu
- `vegetables` - All vegetables including root vegetables
- `fruits` - Fresh and dried fruits
- `dairy` - Milk, cheese, butter, cream, yogurt
- `grains` - Rice, pasta, bread, flour, cereals
- `pantry` - Oils, sauces, spices, canned goods, sweeteners

## How to Add New Ingredients

1. Open `canonical-ingredients.json`
2. Add a new entry to the `ingredients` array:

```json
{
  "name": "new ingredient name",
  "category": "appropriate-category",
  "subcategory": "optional-subcategory",
  "isVegan": true,
  "isVegetarian": true,
  "aliases": ["alias1", "alias2"]
}
```

3. Set the appropriate allergen flags if the ingredient contains allergens
4. Add any common aliases that users might use for this ingredient
5. Run `pnpm db:seed` to update the database

## How to Add Aliases

Aliases allow multiple ingredient names to map to the same canonical entry. This is useful when:

- Different regions use different names (courgette vs zucchini)
- Users might type variations (chicken vs chicken breast)
- Common abbreviations exist

To add aliases:

1. Find the canonical ingredient entry
2. Add the new alias to the `aliases` array (use lowercase)

## Allergen Flags

Set these to `true` if the ingredient contains the allergen:

| Flag                | Allergen                           |
| ------------------- | ---------------------------------- |
| `containsGluten`    | Wheat, barley, rye, oats           |
| `containsDairy`     | Milk, cheese, butter, cream        |
| `containsEggs`      | Eggs or egg products               |
| `containsNuts`      | Tree nuts (almonds, walnuts, etc.) |
| `containsPeanuts`   | Peanuts                            |
| `containsSoy`       | Soy or tofu                        |
| `containsShellfish` | Shrimp, crab, lobster, etc.        |
| `containsFish`      | Fish                               |
| `containsSesame`    | Sesame seeds                       |

## Database Schema

The canonical ingredients are stored in three tables:

- `CanonicalIngredient` - Main ingredient with metadata
- `IngredientAlias` - Maps alias names to canonical ingredients
- `CanonicalIngredientAllergen` - Links ingredients to allergen tags

The `Ingredient` table (used in recipes) has a `canonicalIngredientId` foreign key linking to the canonical entry.

## Updating the Dictionary

After modifying `canonical-ingredients.json`:

```bash
# Regenerate Prisma client (if schema changed)
cd apps/web && npx prisma generate

# Re-seed the database
pnpm db:seed
```

## Best Practices

1. **Use lowercase** for ingredient names and aliases
2. **Be consistent** with category assignments
3. **Include common variations** as aliases
4. **Set allergen flags accurately** - this affects user safety
5. **Test after changes** by running the seed and verifying the data
