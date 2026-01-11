import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hash } from '@node-rs/argon2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface PriceBaselineData {
  category: string;
  stores: Record<
    string,
    {
      pricePerUnit: number;
      unit: string;
    }
  >;
}

interface RecipeIngredientData {
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeStepData {
  stepNumber: number;
  instruction: string;
  durationMinutes?: number | null;
}

interface RecipeNutritionData {
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

interface RecipeImageData {
  url: string;
  isPrimary: boolean;
}

interface RecipeData {
  title: string;
  slug?: string | null;
  description?: string | null;
  mealTypes: string[];
  servingsDefault: number;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  totalTimeMinutes?: number | null;
  calories?: number | null;
  difficulty?: string | null;
  sourceUrl?: string | null;
  sourceAttribution?: string | null;
  isVegetarian: boolean;
  isDairyFree: boolean;
  instructionsMd?: string | null;
  imageUrl?: string | null;
  steps: RecipeStepData[];
  ingredients: RecipeIngredientData[];
  dietTags: string[];
  allergenTags: string[];
  nutrition?: RecipeNutritionData | null;
  images: RecipeImageData[];
}

interface SeedIngredientData {
  name: string;
  category: string;
}

interface SeedRecipesFile {
  version: string;
  generatedAt: string;
  ingredients: SeedIngredientData[];
  recipes: RecipeData[];
}

interface CanonicalIngredientData {
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  containsGluten?: boolean;
  containsDairy?: boolean;
  containsEggs?: boolean;
  containsNuts?: boolean;
  containsPeanuts?: boolean;
  containsSoy?: boolean;
  containsShellfish?: boolean;
  containsFish?: boolean;
  containsSesame?: boolean;
  aliases?: string[];
}

interface CanonicalIngredientsFile {
  version: string;
  description: string;
  ingredients: CanonicalIngredientData[];
}

async function main() {
  console.log('🌱 Starting seed...');

  // Load price baselines
  const priceBaselinesPath = path.join(__dirname, 'price-baselines.json');
  const priceBaselinesData = JSON.parse(
    fs.readFileSync(priceBaselinesPath, 'utf-8')
  ) as PriceBaselineData[];

  // Load canonical ingredients
  const canonicalIngredientsPath = path.join(
    __dirname,
    '../../../infra/ingredients/canonical-ingredients.json'
  );
  const canonicalIngredientsData = JSON.parse(
    fs.readFileSync(canonicalIngredientsPath, 'utf-8')
  ) as CanonicalIngredientsFile;

  // Load seed recipes
  const seedRecipesPath = path.join(__dirname, 'seed-recipes.json');
  const seedRecipesData = JSON.parse(fs.readFileSync(seedRecipesPath, 'utf-8')) as SeedRecipesFile;

  // Clear existing data in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...');
    await prisma.priceBaseline.deleteMany();
    await prisma.shoppingListItem.deleteMany();
    await prisma.shoppingList.deleteMany();
    await prisma.mealPlanItem.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.pantryItem.deleteMany();
    // Clean normalized recipe tables
    await prisma.recipeStatusHistory.deleteMany();
    await prisma.recipeImage.deleteMany();
    await prisma.recipeAllergenTag.deleteMany();
    await prisma.recipeDietTag.deleteMany();
    await prisma.recipeNutrition.deleteMany();
    await prisma.recipeStep.deleteMany();
    await prisma.recipeIngredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.allergenTag.deleteMany();
    await prisma.dietTag.deleteMany();
    // Clean canonical ingredient tables
    await prisma.ingredientAlias.deleteMany();
    await prisma.canonicalIngredientAllergen.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.canonicalIngredient.deleteMany();
    await prisma.password.deleteMany();
    await prisma.post.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create test users
  console.log('👥 Creating test users...');
  // Use OWASP-recommended Argon2 parameters in production; lower for dev/demo to improve seed performance.
  const argon2Params =
    process.env.NODE_ENV === 'production'
      ? {
          memoryCost: 47104, // 46 MiB per OWASP
          timeCost: 3,
          outputLen: 32,
          parallelism: 1,
        }
      : {
          memoryCost: 19456, // Lower for faster seeding in dev/demo
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        };
  const defaultSeedPassword = 'P@ssw0rd!';
  const seedPassword = process.env.SEED_USER_PASSWORD ?? defaultSeedPassword;
  const usingDefaultPassword = seedPassword === defaultSeedPassword;

  if (process.env.NODE_ENV === 'production' && usingDefaultPassword) {
    throw new Error(
      'SEED_USER_PASSWORD must be set to a non-default value when seeding production data.'
    );
  }

  const passwordHash = await hash(seedPassword, argon2Params);

  const premiumUser = await prisma.user.create({
    data: {
      email: 'premium@example.com',
      name: 'Premium User',
      role: 'premium',
      password: {
        create: {
          hash: passwordHash,
        },
      },
    },
  });

  const basicUser = await prisma.user.create({
    data: {
      email: 'basic@example.com',
      name: 'Basic User',
      role: 'basic',
      password: {
        create: {
          hash: passwordHash,
        },
      },
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      password: {
        create: {
          hash: passwordHash,
        },
      },
    },
  });

  console.log(`✅ Created premium user: ${premiumUser.email}`);
  console.log(`✅ Created basic user: ${basicUser.email}`);
  console.log(`✅ Created admin user: ${adminUser.email}`);
  console.log(
    usingDefaultPassword
      ? '🔑 Seed user password: using default dev password (set SEED_USER_PASSWORD to override).'
      : '🔑 Seed user password: set via SEED_USER_PASSWORD.'
  );

  // Create canonical ingredients using batch operations for better performance
  console.log('📚 Creating canonical ingredients...');
  const canonicalIngredientMap = new Map<string, string>();

  // Batch create canonical ingredients
  const canonicalCreateData = canonicalIngredientsData.ingredients.map((canonical) => ({
    name: canonical.name,
    category: canonical.category,
    subcategory: canonical.subcategory,
    description: canonical.description,
    isVegan: canonical.isVegan ?? false,
    isVegetarian: canonical.isVegetarian ?? false,
    isGlutenFree: canonical.isGlutenFree ?? true,
    isDairyFree: canonical.isDairyFree ?? true,
    containsGluten: canonical.containsGluten ?? false,
    containsDairy: canonical.containsDairy ?? false,
    containsEggs: canonical.containsEggs ?? false,
    containsNuts: canonical.containsNuts ?? false,
    containsPeanuts: canonical.containsPeanuts ?? false,
    containsSoy: canonical.containsSoy ?? false,
    containsShellfish: canonical.containsShellfish ?? false,
    containsFish: canonical.containsFish ?? false,
    containsSesame: canonical.containsSesame ?? false,
  }));

  await prisma.canonicalIngredient.createMany({
    data: canonicalCreateData,
  });

  // Re-fetch canonical ingredients to build the ID map
  const createdCanonicalIngredients = await prisma.canonicalIngredient.findMany({
    where: {
      name: {
        in: canonicalIngredientsData.ingredients.map((canonical) => canonical.name),
      },
    },
  });

  for (const canonical of createdCanonicalIngredients) {
    canonicalIngredientMap.set(canonical.name.toLowerCase(), canonical.id);
  }

  // Batch create aliases
  const aliasCreateData: { alias: string; canonicalIngredientId: string }[] = [];

  for (const canonical of canonicalIngredientsData.ingredients) {
    const canonicalId = canonicalIngredientMap.get(canonical.name.toLowerCase());
    if (!canonicalId || !canonical.aliases || canonical.aliases.length === 0) {
      continue;
    }

    for (const alias of canonical.aliases) {
      const normalizedAlias = alias.toLowerCase();
      aliasCreateData.push({
        alias: normalizedAlias,
        canonicalIngredientId: canonicalId,
      });
      // Also add alias to the map for quick lookup
      canonicalIngredientMap.set(normalizedAlias, canonicalId);
    }
  }

  if (aliasCreateData.length > 0) {
    await prisma.ingredientAlias.createMany({
      data: aliasCreateData,
    });
  }

  console.log(`✅ Created ${canonicalIngredientsData.ingredients.length} canonical ingredients`);

  // Helper function to find canonical ingredient ID by name
  function findCanonicalIngredientId(name: string): string | undefined {
    return canonicalIngredientMap.get(name.toLowerCase());
  }

  // Create ingredients from seed data
  console.log('🥕 Creating ingredients...');
  const ingredients = seedRecipesData.ingredients;

  // Create ingredients in batches to avoid overwhelming the database
  const ingredientMap = new Map<string, string>();
  for (const ing of ingredients) {
    const created = await prisma.ingredient.create({
      data: {
        name: ing.name,
        category: ing.category,
        canonicalIngredientId: findCanonicalIngredientId(ing.name),
      },
    });
    ingredientMap.set(ing.name.toLowerCase(), created.id);
  }

  console.log(`✅ Created ${ingredients.length} ingredients`);

  // Create diet tags (includes all unique tags from recipes)
  console.log('🏷️ Creating diet tags...');
  // Collect unique diet tags from recipes
  const recipeDietTags = new Set<string>();
  seedRecipesData.recipes.forEach((r) =>
    r.dietTags.forEach((t) => recipeDietTags.add(t.toLowerCase()))
  );
  const dietTagNames = Array.from(recipeDietTags);

  await Promise.all(
    dietTagNames.map((name) =>
      prisma.dietTag.create({
        data: { name },
      })
    )
  );

  console.log(`✅ Created ${dietTagNames.length} diet tags`);

  // Create allergen tags (includes all unique tags from recipes)
  console.log('⚠️ Creating allergen tags...');
  // Collect unique allergen tags from recipes
  const recipeAllergenTags = new Set<string>();
  seedRecipesData.recipes.forEach((r) =>
    r.allergenTags.forEach((t) => recipeAllergenTags.add(t.toLowerCase()))
  );
  const allergenTagNames = Array.from(recipeAllergenTags);

  await Promise.all(
    allergenTagNames.map((name) =>
      prisma.allergenTag.create({
        data: { name },
      })
    )
  );

  console.log(`✅ Created ${allergenTagNames.length} allergen tags`);

  // Create recipes from seed data
  console.log('🍳 Creating recipes...');

  // Build diet tag and allergen tag maps
  const dietTagMap = new Map<string, string>();
  const allergenTagMap = new Map<string, string>();

  const allDietTags = await prisma.dietTag.findMany();
  const allAllergenTags = await prisma.allergenTag.findMany();

  allDietTags.forEach((tag) => dietTagMap.set(tag.name.toLowerCase(), tag.id));
  allAllergenTags.forEach((tag) => allergenTagMap.set(tag.name.toLowerCase(), tag.id));

  // Seed recipes
  let recipeCount = 0;
  for (const recipe of seedRecipesData.recipes) {
    try {
      // Create the recipe
      const createdRecipe = await prisma.recipe.create({
        data: {
          title: recipe.title,
          slug: recipe.slug,
          description: recipe.description,
          mealTypes: recipe.mealTypes,
          servingsDefault: recipe.servingsDefault,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          totalTimeMinutes: recipe.totalTimeMinutes,
          calories: recipe.calories ?? 0,
          status: 'APPROVED',
          difficulty: (recipe.difficulty as 'EASY' | 'MEDIUM' | 'HARD') ?? undefined,
          publishedAt: new Date(),
          sourceUrl: recipe.sourceUrl,
          sourceAttribution: recipe.sourceAttribution,
          isVegetarian: recipe.isVegetarian,
          isDairyFree: recipe.isDairyFree,
          instructionsMd: recipe.instructionsMd,
          imageUrl: recipe.imageUrl,
        },
      });

      // Create recipe steps
      if (recipe.steps.length > 0) {
        await prisma.recipeStep.createMany({
          data: recipe.steps.map((step) => ({
            recipeId: createdRecipe.id,
            stepNumber: step.stepNumber,
            instruction: step.instruction,
            durationMinutes: step.durationMinutes,
          })),
        });
      }

      // Create recipe ingredients
      for (const ing of recipe.ingredients) {
        const ingredientId = ingredientMap.get(ing.name.toLowerCase());
        if (ingredientId) {
          await prisma.recipeIngredient.create({
            data: {
              recipeId: createdRecipe.id,
              ingredientId,
              quantity: ing.quantity,
              unit: ing.unit,
            },
          });
        }
      }

      // Create recipe diet tags
      for (const tagName of recipe.dietTags) {
        const tagId = dietTagMap.get(tagName.toLowerCase());
        if (tagId) {
          await prisma.recipeDietTag.create({
            data: {
              recipeId: createdRecipe.id,
              dietTagId: tagId,
            },
          });
        }
      }

      // Create recipe allergen tags
      for (const tagName of recipe.allergenTags) {
        const tagId = allergenTagMap.get(tagName.toLowerCase());
        if (tagId) {
          await prisma.recipeAllergenTag.create({
            data: {
              recipeId: createdRecipe.id,
              allergenTagId: tagId,
            },
          });
        }
      }

      // Create recipe nutrition
      if (recipe.nutrition) {
        await prisma.recipeNutrition.create({
          data: {
            recipeId: createdRecipe.id,
            calories: recipe.nutrition.calories,
            protein: recipe.nutrition.protein,
            carbohydrates: recipe.nutrition.carbohydrates,
            fat: recipe.nutrition.fat,
            fiber: recipe.nutrition.fiber,
            sugar: recipe.nutrition.sugar,
            sodium: recipe.nutrition.sodium,
            cholesterol: recipe.nutrition.cholesterol,
            saturatedFat: recipe.nutrition.saturatedFat,
          },
        });
      }

      // Create recipe images
      if (recipe.images.length > 0) {
        await prisma.recipeImage.createMany({
          data: recipe.images.map((img) => ({
            recipeId: createdRecipe.id,
            url: img.url,
            isPrimary: img.isPrimary,
          })),
        });
      }

      recipeCount++;
    } catch (error) {
      console.warn(`⚠️ Failed to create recipe "${recipe.title}":`, error);
    }
  }

  console.log(`✅ Created ${recipeCount} recipes`);

  // Create price baselines
  console.log('💰 Creating price baselines...');
  for (const categoryData of priceBaselinesData) {
    for (const [store, priceInfo] of Object.entries(categoryData.stores)) {
      await prisma.priceBaseline.create({
        data: {
          ingredientCategory: categoryData.category,
          store,
          pricePerUnit: priceInfo.pricePerUnit,
          unit: priceInfo.unit,
        },
      });
    }
  }

  console.log('✅ Seed completed successfully!');
}

if (process.argv[1] === __filename) {
  main()
    .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
