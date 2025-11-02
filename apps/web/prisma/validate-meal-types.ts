import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

interface ValidationResult {
  recipeId: string;
  title: string;
  mealTypes: string[];
  issues: string[];
}

async function validateMealTypes(): Promise<{
  valid: ValidationResult[];
  invalid: ValidationResult[];
}> {
  console.log('🔍 Starting mealTypes validation...\n');

  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      mealTypes: true,
    },
  });

  const valid: ValidationResult[] = [];
  const invalid: ValidationResult[] = [];

  for (const recipe of recipes) {
    const issues: string[] = [];

    // Check if mealTypes is empty
    if (recipe.mealTypes?.length === 0) {
      issues.push('Empty mealTypes array');
    }

    // Check for invalid values
    const invalidTypes = recipe.mealTypes.filter(
      (type) => !VALID_MEAL_TYPES.includes(type as (typeof VALID_MEAL_TYPES)[number])
    );
    if (invalidTypes.length > 0) {
      issues.push(`Invalid meal types: ${invalidTypes.join(', ')}`);
    }

    const result: ValidationResult = {
      recipeId: recipe.id,
      title: recipe.title,
      mealTypes: recipe.mealTypes,
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

async function fixCorruptedMealTypes(corrupted: ValidationResult[]): Promise<void> {
  console.log('🔧 Fixing corrupted mealTypes...\n');

  for (const recipe of corrupted) {
    // Filter out invalid meal types, keeping only valid ones
    const validTypes = recipe.mealTypes.filter((type) =>
      VALID_MEAL_TYPES.includes(type as (typeof VALID_MEAL_TYPES)[number])
    );

    // If no valid types remain, default to ['lunch', 'dinner']
    const fixedTypes = validTypes.length > 0 ? validTypes : ['lunch', 'dinner'];

    await prisma.recipe.update({
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

void main();
