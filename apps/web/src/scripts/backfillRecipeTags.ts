#!/usr/bin/env npx tsx
/**
 * Backfill Recipe Tags Script
 *
 * Recomputes and persists diet/allergen tags for all recipes using
 * the canonical ingredient derivation service.
 *
 * Usage:
 *   pnpm backfill:tags              # Run backfill
 *   pnpm backfill:tags --dry-run    # Preview changes without writing
 *
 * This script:
 * 1. Reads all recipes with their ingredients and canonical data
 * 2. Derives diet and allergen tags using the derivation service
 * 3. Creates/updates RecipeDietTag and RecipeAllergenTag records
 * 4. Updates legacy isVegetarian/isDairyFree boolean fields
 */

import { PrismaClient } from '@prisma/client';
import { deriveRecipeTags, type IngredientWithCanonical } from '../lib/ingredients/derivation';

const prisma = new PrismaClient();

interface BackfillStats {
  recipesProcessed: number;
  recipesUpdated: number;
  recipesSkipped: number;
  dietTagsCreated: number;
  allergenTagsCreated: number;
  errors: string[];
}

async function backfillRecipeTags(dryRun: boolean): Promise<BackfillStats> {
  const stats: BackfillStats = {
    recipesProcessed: 0,
    recipesUpdated: 0,
    recipesSkipped: 0,
    dietTagsCreated: 0,
    allergenTagsCreated: 0,
    errors: [],
  };

  console.log(`\n🏷️  Recipe Tag Backfill ${dryRun ? '(DRY RUN)' : ''}`);
  console.log('='.repeat(50));

  // Load all diet and allergen tags
  const dietTags = await prisma.dietTag.findMany();
  const allergenTags = await prisma.allergenTag.findMany();

  const dietTagMap = new Map(dietTags.map((t) => [t.name, t.id]));
  const allergenTagMap = new Map(allergenTags.map((t) => [t.name, t.id]));

  console.log(`📚 Loaded ${dietTags.length} diet tags, ${allergenTags.length} allergen tags`);

  // Load all recipes with ingredients and canonical data
  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: {
            include: {
              canonicalIngredient: true,
            },
          },
        },
      },
      dietTags: true,
      allergenTags: true,
    },
  });

  console.log(`📖 Found ${recipes.length} recipes to process\n`);

  for (const recipe of recipes) {
    stats.recipesProcessed++;

    try {
      // Build ingredient data for derivation
      const ingredientsWithCanonical: IngredientWithCanonical[] = recipe.ingredients.map((ri) => ({
        name: ri.ingredient.name,
        canonicalIngredient: ri.ingredient.canonicalIngredient
          ? {
              name: ri.ingredient.canonicalIngredient.name,
              category: ri.ingredient.canonicalIngredient.category,
              isVegan: ri.ingredient.canonicalIngredient.isVegan,
              isVegetarian: ri.ingredient.canonicalIngredient.isVegetarian,
              isGlutenFree: ri.ingredient.canonicalIngredient.isGlutenFree,
              isDairyFree: ri.ingredient.canonicalIngredient.isDairyFree,
              containsGluten: ri.ingredient.canonicalIngredient.containsGluten,
              containsDairy: ri.ingredient.canonicalIngredient.containsDairy,
              containsEggs: ri.ingredient.canonicalIngredient.containsEggs,
              containsNuts: ri.ingredient.canonicalIngredient.containsNuts,
              containsPeanuts: ri.ingredient.canonicalIngredient.containsPeanuts,
              containsSoy: ri.ingredient.canonicalIngredient.containsSoy,
              containsShellfish: ri.ingredient.canonicalIngredient.containsShellfish,
              containsFish: ri.ingredient.canonicalIngredient.containsFish,
              containsSesame: ri.ingredient.canonicalIngredient.containsSesame,
            }
          : null,
      }));

      // Derive tags
      const derived = deriveRecipeTags(ingredientsWithCanonical);

      // Calculate what needs to change
      const currentDietTagNames = new Set(
        recipe.dietTags.map((dt) => {
          // Access the diet tag name - need to get it from the relation
          return dietTags.find((t) => t.id === dt.dietTagId)?.name ?? '';
        })
      );
      const currentAllergenTagNames = new Set(
        recipe.allergenTags.map((at) => {
          return allergenTags.find((t) => t.id === at.allergenTagId)?.name ?? '';
        })
      );

      const newDietTagNames = new Set<string>(derived.dietTags);
      const newAllergenTagNames = new Set<string>(derived.allergenTags);

      // Check if anything needs to change
      const dietTagsMatch =
        currentDietTagNames.size === newDietTagNames.size &&
        [...currentDietTagNames].every((t) => newDietTagNames.has(t));
      const allergenTagsMatch =
        currentAllergenTagNames.size === newAllergenTagNames.size &&
        [...currentAllergenTagNames].every((t) => newAllergenTagNames.has(t));
      const boolsMatch =
        recipe.isVegetarian === derived.isVegetarian && recipe.isDairyFree === derived.isDairyFree;

      if (dietTagsMatch && allergenTagsMatch && boolsMatch) {
        stats.recipesSkipped++;
        continue;
      }

      // Log changes
      console.log(`📝 ${recipe.title}`);

      if (!boolsMatch) {
        console.log(
          `   Booleans: vegetarian ${recipe.isVegetarian}→${derived.isVegetarian}, ` +
            `dairyFree ${recipe.isDairyFree}→${derived.isDairyFree}`
        );
      }

      if (!dietTagsMatch) {
        const added = derived.dietTags.filter((t: string) => !currentDietTagNames.has(t));
        const removed = [...currentDietTagNames].filter((t: string) => !newDietTagNames.has(t));
        if (added.length > 0) console.log(`   Diet tags +: ${added.join(', ')}`);
        if (removed.length > 0) console.log(`   Diet tags -: ${removed.join(', ')}`);
      }

      if (!allergenTagsMatch) {
        const added = derived.allergenTags.filter((t: string) => !currentAllergenTagNames.has(t));
        const removed = [...currentAllergenTagNames].filter(
          (t: string) => !newAllergenTagNames.has(t)
        );
        if (added.length > 0) console.log(`   Allergens +: ${added.join(', ')}`);
        if (removed.length > 0) console.log(`   Allergens -: ${removed.join(', ')}`);
      }

      if (!dryRun) {
        // Perform update in a transaction
        await prisma.$transaction(async (tx) => {
          // Update boolean fields
          await tx.recipe.update({
            where: { id: recipe.id },
            data: {
              isVegetarian: derived.isVegetarian,
              isDairyFree: derived.isDairyFree,
            },
          });

          // Remove existing diet tags and add new ones
          await tx.recipeDietTag.deleteMany({
            where: { recipeId: recipe.id },
          });

          for (const tagName of derived.dietTags) {
            const tagId = dietTagMap.get(tagName);
            if (tagId) {
              await tx.recipeDietTag.create({
                data: {
                  recipeId: recipe.id,
                  dietTagId: tagId,
                },
              });
              stats.dietTagsCreated++;
            }
          }

          // Remove existing allergen tags and add new ones
          await tx.recipeAllergenTag.deleteMany({
            where: { recipeId: recipe.id },
          });

          for (const tagName of derived.allergenTags) {
            const tagId = allergenTagMap.get(tagName);
            if (tagId) {
              await tx.recipeAllergenTag.create({
                data: {
                  recipeId: recipe.id,
                  allergenTagId: tagId,
                },
              });
              stats.allergenTagsCreated++;
            }
          }
        });
      }

      stats.recipesUpdated++;
    } catch (error) {
      const errorMessage = `Error processing "${recipe.title}": ${error instanceof Error ? error.message : String(error)}`;
      stats.errors.push(errorMessage);
      console.error(`   ❌ ${errorMessage}`);
    }
  }

  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  try {
    const stats = await backfillRecipeTags(dryRun);

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary');
    console.log('='.repeat(50));
    console.log(`   Recipes processed: ${stats.recipesProcessed}`);
    console.log(`   Recipes updated:   ${stats.recipesUpdated}`);
    console.log(`   Recipes skipped:   ${stats.recipesSkipped} (no changes needed)`);
    console.log(`   Diet tags created: ${stats.dietTagsCreated}`);
    console.log(`   Allergen tags:     ${stats.allergenTagsCreated}`);

    if (stats.errors.length > 0) {
      console.log(`\n   ⚠️  Errors: ${stats.errors.length}`);
      for (const err of stats.errors) {
        console.log(`      - ${err}`);
      }
    }

    if (dryRun) {
      console.log('\n🔍 DRY RUN - No changes were made');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Backfill complete!');
    }

    process.exit(stats.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
