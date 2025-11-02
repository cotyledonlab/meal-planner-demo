import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import { VALID_MEAL_TYPES } from '@meal-planner-demo/constants';

const prisma = new PrismaClient();
const scriptFilename = fileURLToPath(import.meta.url);

type MealType = (typeof VALID_MEAL_TYPES)[number];

export interface ValidationResult {
  recipeId: string;
  title: string;
  mealTypes: string[];
  issues: string[];
}

interface RecipeSummary {
  id: string;
  title: string;
  mealTypes: unknown;
}

type RecipeDelegate = Pick<typeof prisma.recipe, 'findMany'>;

function isValidMealType(type: string): type is MealType {
  return VALID_MEAL_TYPES.includes(type as MealType);
}

export function evaluateMealTypes(recipes: RecipeSummary[]): {
  valid: ValidationResult[];
  invalid: ValidationResult[];
} {
  const valid: ValidationResult[] = [];
  const invalid: ValidationResult[] = [];

  for (const recipe of recipes) {
    const issues: string[] = [];
    const mealTypes: string[] = [];
    const invalidLabels: string[] = [];

    if (!Array.isArray(recipe.mealTypes)) {
      issues.push('Missing mealTypes array');
    } else {
      if (recipe.mealTypes.length === 0) {
        issues.push('Empty mealTypes array');
      }

      for (const type of recipe.mealTypes) {
        if (typeof type !== 'string') {
          invalidLabels.push(String(type));
          continue;
        }

        mealTypes.push(type);

        if (!isValidMealType(type)) {
          invalidLabels.push(type);
        }
      }
    }

    if (invalidLabels.length > 0) {
      issues.push(`Invalid meal types: ${invalidLabels.join(', ')}`);
    }

    const result: ValidationResult = {
      recipeId: recipe.id,
      title: recipe.title,
      mealTypes,
      issues,
    };

    if (issues.length > 0) {
      invalid.push(result);
    } else {
      valid.push(result);
    }
  }

  return { valid, invalid };
}

export async function validateMealTypes(recipeDelegate: RecipeDelegate = prisma.recipe): Promise<{
  valid: ValidationResult[];
  invalid: ValidationResult[];
}> {
  console.log('🔍 Starting mealTypes validation...\n');

  const recipes = await recipeDelegate.findMany({
    select: {
      id: true,
      title: true,
      mealTypes: true,
    },
  });

  return evaluateMealTypes(recipes);
}

const FALLBACK_MEAL_TYPES: MealType[] = ['lunch', 'dinner'];

type RecipeUpdateArgs = {
  where: { id: string };
  data: { mealTypes: MealType[] };
};

type RecipeModel = {
  update: (args: RecipeUpdateArgs) => Promise<unknown>;
};

export async function fixCorruptedMealTypes(
  corrupted: ValidationResult[],
  recipeModel: RecipeModel = prisma.recipe
): Promise<void> {
  console.log('🔧 Fixing corrupted mealTypes...\n');

  for (const recipe of corrupted) {
    // Filter out invalid meal types, keeping only valid ones
    const validTypes = recipe.mealTypes.filter((type) => isValidMealType(type));

    // If no valid types remain, default to ['lunch', 'dinner']
    const fixedTypes = validTypes.length > 0 ? validTypes : [...FALLBACK_MEAL_TYPES];

    await recipeModel.update({
      where: { id: recipe.recipeId },
      data: { mealTypes: fixedTypes },
    });

    console.log(
      `✅ Fixed "${recipe.title}": ${recipe.mealTypes.join(', ')} → ${fixedTypes.join(', ')}`
    );
  }
}

async function main() {
  try {
    const { valid, invalid } = await validateMealTypes();

    console.log('📊 Validation Results');
    console.log('═'.repeat(50));
    console.log(`✅ Valid recipes: ${valid.length}`);
    console.log(`❌ Invalid recipes: ${invalid.length}`);
    console.log('═'.repeat(50));
    console.log();

    if (invalid.length > 0) {
      console.log('❌ Corrupted/Invalid Recipes:\n');
      for (const recipe of invalid) {
        console.log(`Recipe: "${recipe.title}" (${recipe.recipeId})`);
        console.log(`  Current mealTypes: [${recipe.mealTypes.join(', ')}]`);
        console.log(`  Issues: ${recipe.issues.join('; ')}`);
        console.log();
      }

      // Ask if user wants to fix
      const shouldFix = process.env.AUTO_FIX === 'true';

      if (shouldFix) {
        await fixCorruptedMealTypes(invalid);
        console.log('\n✅ All corrupted mealTypes have been fixed!');
      } else {
        console.log(
          '⚠️  To auto-fix corrupted data, run: AUTO_FIX=true tsx validate-meal-types.ts'
        );
      }

      process.exit(invalid.length > 0 ? 1 : 0);
    } else {
      console.log('✅ All recipes have valid mealTypes!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error during validation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined;

if (invokedPath === scriptFilename) {
  void main();
}
