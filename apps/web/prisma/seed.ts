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

  // Create ingredients
  console.log('🥕 Creating ingredients...');
  const ingredients = [
    // Proteins
    { name: 'chicken breast', category: 'protein' },
    { name: 'ground beef', category: 'protein' },
    { name: 'salmon fillet', category: 'protein' },
    { name: 'eggs', category: 'protein' },
    { name: 'tofu', category: 'protein' },
    { name: 'chickpeas', category: 'protein' },
    { name: 'bacon', category: 'protein' },
    { name: 'sausages', category: 'protein' },
    { name: 'chicken thighs', category: 'protein' },
    { name: 'pork chops', category: 'protein' },
    { name: 'lentils', category: 'protein' },
    { name: 'kidney beans', category: 'protein' },
    { name: 'tuna', category: 'protein' },
    // Vegetables
    { name: 'bell peppers', category: 'vegetables' },
    { name: 'broccoli', category: 'vegetables' },
    { name: 'carrots', category: 'vegetables' },
    { name: 'onions', category: 'vegetables' },
    { name: 'garlic', category: 'vegetables' },
    { name: 'tomatoes', category: 'vegetables' },
    { name: 'spinach', category: 'vegetables' },
    { name: 'potatoes', category: 'vegetables' },
    { name: 'mushrooms', category: 'vegetables' },
    { name: 'courgette', category: 'vegetables' },
    { name: 'leek', category: 'vegetables' },
    { name: 'cabbage', category: 'vegetables' },
    { name: 'peas', category: 'vegetables' },
    { name: 'sweetcorn', category: 'vegetables' },
    { name: 'celery', category: 'vegetables' },
    { name: 'parsnips', category: 'vegetables' },
    // Fruits
    { name: 'berries', category: 'fruits' },
    { name: 'banana', category: 'fruits' },
    { name: 'avocado', category: 'fruits' },
    { name: 'lemon juice', category: 'fruits' },
    // Dairy
    { name: 'milk', category: 'dairy' },
    { name: 'cheese', category: 'dairy' },
    { name: 'butter', category: 'dairy' },
    { name: 'yogurt', category: 'dairy' },
    { name: 'cream', category: 'dairy' },
    { name: 'cheddar cheese', category: 'dairy' },
    { name: 'buttermilk', category: 'dairy' },
    { name: 'greek yogurt', category: 'dairy' },
    { name: 'almond milk', category: 'dairy' },
    // Grains
    { name: 'rice', category: 'grains' },
    { name: 'pasta', category: 'grains' },
    { name: 'bread', category: 'grains' },
    { name: 'flour', category: 'grains' },
    { name: 'oats', category: 'grains' },
    { name: 'tortillas', category: 'grains' },
    { name: 'noodles', category: 'grains' },
    // Pantry
    { name: 'olive oil', category: 'pantry' },
    { name: 'soy sauce', category: 'pantry' },
    { name: 'coconut milk', category: 'pantry' },
    { name: 'curry paste', category: 'pantry' },
    { name: 'tomato paste', category: 'pantry' },
    { name: 'stock cube', category: 'pantry' },
    { name: 'tinned tomatoes', category: 'pantry' },
    { name: 'worcestershire sauce', category: 'pantry' },
    { name: 'chilli powder', category: 'pantry' },
    { name: 'cumin', category: 'pantry' },
    { name: 'paprika', category: 'pantry' },
    { name: 'mixed herbs', category: 'pantry' },
    { name: 'honey', category: 'pantry' },
    { name: 'balsamic vinegar', category: 'pantry' },
    { name: 'vegetable oil', category: 'pantry' },
    { name: 'baked beans', category: 'pantry' },
    { name: 'sugar', category: 'pantry' },
    { name: 'baking powder', category: 'pantry' },
    { name: 'maple syrup', category: 'pantry' },
    { name: 'chia seeds', category: 'pantry' },
    { name: 'chili flakes', category: 'pantry' },
    { name: 'cinnamon', category: 'pantry' },
    { name: 'granola', category: 'pantry' },
    { name: 'nuts', category: 'pantry' },
    { name: 'vanilla extract', category: 'pantry' },
  ];

  await Promise.all(
    ingredients.map((ing) =>
      prisma.ingredient.create({
        data: {
          ...ing,
          canonicalIngredientId: findCanonicalIngredientId(ing.name),
        },
      })
    )
  );

  console.log(`✅ Created ${ingredients.length} ingredients`);

  // Create diet tags
  console.log('🏷️ Creating diet tags...');
  const dietTagNames = [
    'vegetarian',
    'vegan',
    'pescatarian',
    'keto',
    'paleo',
    'low-carb',
    'gluten-free',
    'dairy-free',
    'halal',
    'kosher',
  ];

  await Promise.all(
    dietTagNames.map((name) =>
      prisma.dietTag.create({
        data: { name },
      })
    )
  );

  console.log(`✅ Created ${dietTagNames.length} diet tags`);

  // Create allergen tags
  console.log('⚠️ Creating allergen tags...');
  const allergenTagNames = [
    'gluten',
    'dairy',
    'eggs',
    'nuts',
    'peanuts',
    'soy',
    'shellfish',
    'fish',
    'sesame',
    'mustard',
    'celery',
    'sulphites',
  ];

  await Promise.all(
    allergenTagNames.map((name) =>
      prisma.allergenTag.create({
        data: { name },
      })
    )
  );

  console.log(`✅ Created ${allergenTagNames.length} allergen tags`);

  // Note: Recipe seeding has been removed. Use the admin tools at /dashboard/admin/recipes/new
  // to create recipes with AI-generated content and images.

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
