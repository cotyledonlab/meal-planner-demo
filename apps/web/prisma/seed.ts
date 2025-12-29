import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hash } from '@node-rs/argon2';
import { VALID_MEAL_TYPES } from '@meal-planner-demo/constants';

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

type MealType = (typeof VALID_MEAL_TYPES)[number];

export function validateMealTypes(mealTypes: unknown, recipeTitle: string): MealType[] {
  if (!Array.isArray(mealTypes) || mealTypes.length === 0) {
    throw new Error(
      `Recipe "${recipeTitle}" has missing or empty mealTypes array. Must contain at least one of: ${VALID_MEAL_TYPES.join(', ')}`
    );
  }

  const invalidTypes = mealTypes.filter(
    (type) => typeof type !== 'string' || !VALID_MEAL_TYPES.includes(type as MealType)
  );

  if (invalidTypes.length > 0) {
    const invalidLabels = invalidTypes.map((type) => String(type));
    throw new Error(
      `Recipe "${recipeTitle}" has invalid meal types: [${invalidLabels.join(', ')}]. Valid types are: ${VALID_MEAL_TYPES.join(', ')}`
    );
  }

  return mealTypes as MealType[];
}

async function main() {
  console.log('🌱 Starting seed...');

  // Load price baselines
  const priceBaselinesPath = path.join(__dirname, 'price-baselines.json');
  const priceBaselinesData = JSON.parse(
    fs.readFileSync(priceBaselinesPath, 'utf-8')
  ) as PriceBaselineData[];

  // Clear existing data in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning existing data...');
    await prisma.priceBaseline.deleteMany();
    await prisma.shoppingListItem.deleteMany();
    await prisma.shoppingList.deleteMany();
    await prisma.mealPlanItem.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.pantryItem.deleteMany();
    await prisma.recipeIngredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.ingredient.deleteMany();
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
  const passwordHash = await hash('P@ssw0rd!', argon2Params);

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
  console.log(`🔑 Password for all users: P@ssw0rd!`);

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

  const createdIngredients = await Promise.all(
    ingredients.map((ing) => prisma.ingredient.create({ data: ing }))
  );

  const ingredientMap = new Map(createdIngredients.map((ing) => [ing.name, ing.id]));

  // Create recipes
  console.log('🍽️ Creating recipes...');

  const recipes = [
    {
      title: 'Chicken & Vegetable Stir Fry',
      minutes: 25,
      calories: 420,
      isVegetarian: false,
      isDairyFree: true,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
      instructionsMd: `
# Chicken & Vegetable Stir Fry

## Instructions
1. Cut chicken breast into bite-sized pieces
2. Dice bell peppers, broccoli, and carrots
3. Heat oil in a wok or large pan over high heat
4. Cook chicken until golden, about 5-7 minutes
5. Add vegetables and stir-fry for 3-4 minutes
6. Add soy sauce and garlic, cook for 1 minute
7. Serve over rice

## Tips
- Use high heat for best results
- Don't overcrowd the pan
- Keep ingredients moving constantly
      `.trim(),
      ingredients: [
        { name: 'chicken breast', qty: 600, unit: 'g' },
        { name: 'bell peppers', qty: 200, unit: 'g' },
        { name: 'broccoli', qty: 200, unit: 'g' },
        { name: 'carrots', qty: 150, unit: 'g' },
        { name: 'garlic', qty: 10, unit: 'g' },
        { name: 'soy sauce', qty: 50, unit: 'ml' },
        { name: 'olive oil', qty: 30, unit: 'ml' },
        { name: 'rice', qty: 300, unit: 'g' },
      ],
    },
    {
      title: 'Mediterranean Pasta Salad',
      minutes: 20,
      calories: 380,
      isVegetarian: true,
      isDairyFree: false,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
      instructionsMd: `
# Mediterranean Pasta Salad

## Instructions
1. Cook pasta according to package directions
2. Dice tomatoes, bell peppers, and onions
3. Drain pasta and rinse with cold water
4. Mix pasta with vegetables
5. Add olive oil, garlic, and cheese
6. Season with salt and pepper
7. Chill before serving

## Tips
- Use quality olive oil for best flavor
- Can be made ahead and refrigerated
- Add fresh herbs if available
      `.trim(),
      ingredients: [
        { name: 'pasta', qty: 400, unit: 'g' },
        { name: 'tomatoes', qty: 300, unit: 'g' },
        { name: 'bell peppers', qty: 150, unit: 'g' },
        { name: 'onions', qty: 100, unit: 'g' },
        { name: 'cheese', qty: 150, unit: 'g' },
        { name: 'olive oil', qty: 60, unit: 'ml' },
        { name: 'garlic', qty: 10, unit: 'g' },
      ],
    },
    {
      title: "Beef Shepherd's Pie",
      minutes: 45,
      calories: 520,
      isVegetarian: false,
      isDairyFree: false,
      mealTypes: ['dinner'],
      servingsDefault: 6,
      imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80',
      instructionsMd: `
# Beef Shepherd's Pie

## Instructions
1. Peel and chop potatoes, boil until tender
2. Brown ground beef in a large pan
3. Add onions, carrots, and garlic
4. Add tomato paste and stock
5. Simmer for 15 minutes
6. Mash potatoes with butter and milk
7. Layer beef mixture in baking dish
8. Top with mashed potatoes
9. Bake at 180°C for 25 minutes

## Tips
- Can be frozen for later
- Great for batch cooking
- Add peas for extra vegetables
      `.trim(),
      ingredients: [
        { name: 'ground beef', qty: 800, unit: 'g' },
        { name: 'potatoes', qty: 1000, unit: 'g' },
        { name: 'carrots', qty: 200, unit: 'g' },
        { name: 'onions', qty: 150, unit: 'g' },
        { name: 'garlic', qty: 10, unit: 'g' },
        { name: 'tomato paste', qty: 50, unit: 'g' },
        { name: 'butter', qty: 50, unit: 'g' },
        { name: 'milk', qty: 100, unit: 'ml' },
        { name: 'stock cube', qty: 1, unit: 'pcs' },
      ],
    },
    {
      title: 'Thai Red Curry with Rice',
      minutes: 30,
      calories: 450,
      isVegetarian: false,
      isDairyFree: true,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
      instructionsMd: `
# Thai Red Curry with Rice

## Instructions
1. Cook rice according to package directions
2. Cut chicken into bite-sized pieces
3. Slice bell peppers and onions
4. Heat oil in a large pan
5. Cook chicken until golden
6. Add curry paste and cook for 1 minute
7. Add coconut milk and vegetables
8. Simmer for 10-15 minutes
9. Serve over rice

## Tips
- Adjust curry paste to taste
- Add bamboo shoots for authenticity
- Garnish with fresh basil
      `.trim(),
      ingredients: [
        { name: 'chicken breast', qty: 500, unit: 'g' },
        { name: 'coconut milk', qty: 400, unit: 'ml' },
        { name: 'curry paste', qty: 50, unit: 'g' },
        { name: 'bell peppers', qty: 200, unit: 'g' },
        { name: 'onions', qty: 100, unit: 'g' },
        { name: 'rice', qty: 300, unit: 'g' },
        { name: 'olive oil', qty: 20, unit: 'ml' },
      ],
    },
    {
      title: 'Salmon with Roasted Vegetables',
      minutes: 35,
      calories: 490,
      isVegetarian: false,
      isDairyFree: true,
      mealTypes: ['dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80',
      instructionsMd: `
# Salmon with Roasted Vegetables

## Instructions
1. Preheat oven to 200°C
2. Cut vegetables into even pieces
3. Toss vegetables with olive oil
4. Place vegetables on baking sheet
5. Season salmon fillets
6. Add salmon to baking sheet
7. Roast for 20-25 minutes
8. Serve immediately

## Tips
- Don't overcook the salmon
- Use fresh herbs for garnish
- Squeeze lemon over before serving
      `.trim(),
      ingredients: [
        { name: 'salmon fillet', qty: 600, unit: 'g' },
        { name: 'broccoli', qty: 300, unit: 'g' },
        { name: 'carrots', qty: 200, unit: 'g' },
        { name: 'bell peppers', qty: 200, unit: 'g' },
        { name: 'potatoes', qty: 400, unit: 'g' },
        { name: 'olive oil', qty: 40, unit: 'ml' },
        { name: 'garlic', qty: 10, unit: 'g' },
      ],
    },
    {
      title: 'Vegetable Lasagne',
      minutes: 60,
      calories: 480,
      isVegetarian: true,
      isDairyFree: false,
      mealTypes: ['dinner'],
      servingsDefault: 6,
      imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&q=80',
      instructionsMd: `
# Vegetable Lasagne

## Instructions
1. Preheat oven to 180°C
2. Sauté onions, garlic, and vegetables
3. Add tomato paste and simmer
4. Layer lasagne: sauce, pasta, vegetables, cheese
5. Repeat layers twice more
6. Top with cheese
7. Bake for 40 minutes
8. Let rest for 10 minutes before serving

## Tips
- Can be made ahead and frozen
- Use fresh pasta for best results
- Add spinach for extra nutrition
      `.trim(),
      ingredients: [
        { name: 'pasta', qty: 400, unit: 'g' },
        { name: 'tomatoes', qty: 800, unit: 'g' },
        { name: 'onions', qty: 150, unit: 'g' },
        { name: 'garlic', qty: 15, unit: 'g' },
        { name: 'bell peppers', qty: 200, unit: 'g' },
        { name: 'mushrooms', qty: 200, unit: 'g' },
        { name: 'spinach', qty: 200, unit: 'g' },
        { name: 'cheese', qty: 300, unit: 'g' },
        { name: 'tomato paste', qty: 100, unit: 'g' },
      ],
    },
    {
      title: 'Vegetarian Stir-Fry Bowl',
      minutes: 20,
      calories: 350,
      isVegetarian: true,
      isDairyFree: true,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
      instructionsMd: `
# Vegetarian Stir-Fry Bowl

## Instructions
1. Cook rice according to package directions
2. Press and cube tofu
3. Cut all vegetables into bite-sized pieces
4. Heat oil in wok over high heat
5. Cook tofu until golden
6. Add vegetables and stir-fry
7. Add soy sauce and garlic
8. Serve over rice

## Tips
- Press tofu well for best texture
- Use sesame oil for extra flavor
- Add cashews for crunch
      `.trim(),
      ingredients: [
        { name: 'tofu', qty: 400, unit: 'g' },
        { name: 'broccoli', qty: 200, unit: 'g' },
        { name: 'bell peppers', qty: 200, unit: 'g' },
        { name: 'carrots', qty: 150, unit: 'g' },
        { name: 'mushrooms', qty: 150, unit: 'g' },
        { name: 'rice', qty: 300, unit: 'g' },
        { name: 'soy sauce', qty: 50, unit: 'ml' },
        { name: 'garlic', qty: 10, unit: 'g' },
        { name: 'olive oil', qty: 30, unit: 'ml' },
      ],
    },
    {
      title: 'Chickpea Curry',
      minutes: 35,
      calories: 380,
      isVegetarian: true,
      isDairyFree: true,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
      instructionsMd: `
# Chickpea Curry

## Instructions
1. Cook rice according to package directions
2. Sauté onions and garlic
3. Add curry paste and cook for 1 minute
4. Add tomatoes and coconut milk
5. Add chickpeas and simmer for 20 minutes
6. Add spinach and cook until wilted
7. Serve over rice

## Tips
- Use canned chickpeas for convenience
- Adjust spice level to taste
- Garnish with fresh cilantro
      `.trim(),
      ingredients: [
        { name: 'chickpeas', qty: 400, unit: 'g' },
        { name: 'coconut milk', qty: 400, unit: 'ml' },
        { name: 'tomatoes', qty: 400, unit: 'g' },
        { name: 'onions', qty: 150, unit: 'g' },
        { name: 'garlic', qty: 15, unit: 'g' },
        { name: 'curry paste', qty: 50, unit: 'g' },
        { name: 'spinach', qty: 200, unit: 'g' },
        { name: 'rice', qty: 300, unit: 'g' },
        { name: 'olive oil', qty: 30, unit: 'ml' },
      ],
    },
    {
      title: 'Pasta with Tomato Sauce',
      minutes: 25,
      calories: 420,
      isVegetarian: true,
      isDairyFree: false,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=600&q=80',
      instructionsMd: `
# Pasta with Tomato Sauce

## Instructions
1. Cook pasta according to package directions
2. Sauté garlic and onions in olive oil
3. Add tomatoes and tomato paste
4. Simmer for 15 minutes
5. Season with salt and pepper
6. Drain pasta and mix with sauce
7. Top with cheese
8. Serve hot

## Tips
- Use San Marzano tomatoes for best flavor
- Add fresh basil before serving
- Save pasta water to adjust sauce consistency
      `.trim(),
      ingredients: [
        { name: 'pasta', qty: 400, unit: 'g' },
        { name: 'tomatoes', qty: 600, unit: 'g' },
        { name: 'tomato paste', qty: 50, unit: 'g' },
        { name: 'onions', qty: 100, unit: 'g' },
        { name: 'garlic', qty: 15, unit: 'g' },
        { name: 'olive oil', qty: 40, unit: 'ml' },
        { name: 'cheese', qty: 100, unit: 'g' },
      ],
    },
    {
      title: 'Egg Fried Rice',
      minutes: 15,
      calories: 360,
      isVegetarian: true,
      isDairyFree: true,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
      instructionsMd: `
# Egg Fried Rice

## Instructions
1. Cook rice and let cool (or use day-old rice)
2. Beat eggs and scramble in wok
3. Remove eggs and set aside
4. Heat oil in wok
5. Add rice and break up clumps
6. Add soy sauce and vegetables
7. Return eggs to wok and mix
8. Serve hot

## Tips
- Use day-old rice for best results
- High heat is essential
- Add peas and carrots for color
      `.trim(),
      ingredients: [
        { name: 'rice', qty: 400, unit: 'g' },
        { name: 'eggs', qty: 4, unit: 'pcs' },
        { name: 'carrots', qty: 100, unit: 'g' },
        { name: 'onions', qty: 100, unit: 'g' },
        { name: 'garlic', qty: 10, unit: 'g' },
        { name: 'soy sauce', qty: 40, unit: 'ml' },
        { name: 'olive oil', qty: 30, unit: 'ml' },
      ],
    },
    {
      title: 'Mushroom Risotto',
      minutes: 40,
      calories: 450,
      isVegetarian: true,
      isDairyFree: false,
      mealTypes: ['dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1476124369491-c4adde3469f7?w=600&q=80',
      instructionsMd: `
# Mushroom Risotto

## Instructions
1. Slice mushrooms and sauté until golden
2. Remove mushrooms and set aside
3. Sauté onions and garlic in butter
4. Add rice and toast for 2 minutes
5. Add stock one ladle at a time, stirring constantly
6. Cook for 20-25 minutes until creamy
7. Stir in mushrooms and cheese
8. Serve immediately

## Tips
- Keep stock warm while cooking
- Stir frequently for creaminess
- Add white wine for extra flavor
      `.trim(),
      ingredients: [
        { name: 'rice', qty: 300, unit: 'g' },
        { name: 'mushrooms', qty: 400, unit: 'g' },
        { name: 'onions', qty: 100, unit: 'g' },
        { name: 'garlic', qty: 10, unit: 'g' },
        { name: 'butter', qty: 50, unit: 'g' },
        { name: 'cheese', qty: 100, unit: 'g' },
        { name: 'stock cube', qty: 2, unit: 'pcs' },
      ],
    },
    {
      title: 'Roasted Vegetable Bowl',
      minutes: 35,
      calories: 320,
      isVegetarian: true,
      isDairyFree: true,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
      instructionsMd: `
# Roasted Vegetable Bowl

## Instructions
1. Preheat oven to 200°C
2. Chop all vegetables into even pieces
3. Toss with olive oil and garlic
4. Spread on baking sheets
5. Roast for 25-30 minutes
6. Cook chickpeas separately or add halfway
7. Serve over rice or grains

## Tips
- Don't overcrowd the pan
- Flip vegetables halfway through
- Add your favorite herbs and spices
      `.trim(),
      ingredients: [
        { name: 'chickpeas', qty: 400, unit: 'g' },
        { name: 'bell peppers', qty: 200, unit: 'g' },
        { name: 'broccoli', qty: 200, unit: 'g' },
        { name: 'carrots', qty: 200, unit: 'g' },
        { name: 'onions', qty: 150, unit: 'g' },
        { name: 'garlic', qty: 15, unit: 'g' },
        { name: 'olive oil', qty: 50, unit: 'ml' },
        { name: 'rice', qty: 300, unit: 'g' },
      ],
    },
    {
      title: 'Quick Bacon & Egg Fried Rice',
      minutes: 15,
      calories: 420,
      isVegetarian: false,
      isDairyFree: true,
      mealTypes: ['breakfast', 'lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&q=80',
      instructionsMd: `
# Quick Bacon & Egg Fried Rice

## Instructions
1. Cook rice and let cool (or use leftover rice)
2. Chop bacon and fry until crispy
3. Beat eggs and scramble in the same pan
4. Add rice and break up clumps
5. Add peas, sweetcorn, and soy sauce
6. Stir-fry for 3-4 minutes on high heat
7. Serve hot

## Tips
- Perfect for using up leftover rice
- Great weeknight meal under 15 minutes
- Add any vegetables you have on hand
      `.trim(),
      ingredients: [
        { name: 'rice', qty: 400, unit: 'g' },
        { name: 'bacon', qty: 150, unit: 'g' },
        { name: 'eggs', qty: 3, unit: 'pcs' },
        { name: 'peas', qty: 100, unit: 'g' },
        { name: 'sweetcorn', qty: 100, unit: 'g' },
        { name: 'soy sauce', qty: 40, unit: 'ml' },
        { name: 'vegetable oil', qty: 20, unit: 'ml' },
        { name: 'garlic', qty: 10, unit: 'g' },
      ],
    },
    {
      title: 'One-Pot Sausage & Bean Stew',
      minutes: 30,
      calories: 480,
      isVegetarian: false,
      isDairyFree: true,
      mealTypes: ['dinner'],
      servingsDefault: 6,
      imageUrl: 'https://images.unsplash.com/photo-1604908815817-f8d79f06fe5d?w=600&q=80',
      instructionsMd: `
# One-Pot Sausage & Bean Stew

## Instructions
1. Slice sausages and brown in a large pot
2. Add onions and garlic, cook until soft
3. Add carrots and celery, cook for 5 minutes
4. Add tinned tomatoes, kidney beans, and stock
5. Simmer for 15-20 minutes
6. Season and serve with bread

## Tips
- Use quality Irish sausages from Aldi/Lidl
- Great for batch cooking and freezing
- Serve with crusty bread for dipping
      `.trim(),
      ingredients: [
        { name: 'sausages', qty: 600, unit: 'g' },
        { name: 'kidney beans', qty: 400, unit: 'g' },
        { name: 'tinned tomatoes', qty: 800, unit: 'g' },
        { name: 'onions', qty: 150, unit: 'g' },
        { name: 'garlic', qty: 15, unit: 'g' },
        { name: 'carrots', qty: 200, unit: 'g' },
        { name: 'celery', qty: 100, unit: 'g' },
        { name: 'stock cube', qty: 2, unit: 'pcs' },
        { name: 'bread', qty: 200, unit: 'g' },
      ],
    },
    {
      title: 'Irish Beef & Guinness Stew',
      minutes: 120,
      calories: 550,
      isVegetarian: false,
      isDairyFree: true,
      mealTypes: ['dinner'],
      servingsDefault: 6,
      imageUrl: 'https://images.unsplash.com/photo-1607894842937-e6c29b2e2f4c?w=600&q=80',
      instructionsMd: `
# Irish Beef & Guinness Stew

## Instructions
1. Brown beef chunks in batches
2. Sauté onions, carrots, and celery
3. Return beef to pot, add flour
4. Add stock, tomato paste, and seasonings
5. Simmer covered for 90 minutes
6. Add potatoes and parsnips
7. Cook for 30 more minutes until tender
8. Serve with mashed potatoes or bread

## Tips
- Perfect Sunday batch meal
- Freezes beautifully
- Even better the next day
      `.trim(),
      ingredients: [
        { name: 'ground beef', qty: 1000, unit: 'g' },
        { name: 'potatoes', qty: 600, unit: 'g' },
        { name: 'carrots', qty: 300, unit: 'g' },
        { name: 'onions', qty: 200, unit: 'g' },
        { name: 'celery', qty: 150, unit: 'g' },
        { name: 'parsnips', qty: 200, unit: 'g' },
        { name: 'tomato paste', qty: 50, unit: 'g' },
        { name: 'flour', qty: 50, unit: 'g' },
        { name: 'stock cube', qty: 2, unit: 'pcs' },
      ],
    },
    {
      title: 'Tuna Pasta Bake',
      minutes: 35,
      calories: 460,
      isVegetarian: false,
      isDairyFree: false,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=600&q=80',
      instructionsMd: `
# Tuna Pasta Bake

## Instructions
1. Preheat oven to 180°C
2. Cook pasta according to package directions
3. Mix tuna, peas, sweetcorn, and pasta
4. Make white sauce with butter, flour, and milk
5. Combine everything and pour into baking dish
6. Top with grated cheese
7. Bake for 20-25 minutes until golden

## Tips
- Use tinned tuna from Aldi for budget-friendly option
- Add any leftover vegetables
- Great for meal prep lunches
      `.trim(),
      ingredients: [
        { name: 'pasta', qty: 400, unit: 'g' },
        { name: 'tuna', qty: 300, unit: 'g' },
        { name: 'peas', qty: 150, unit: 'g' },
        { name: 'sweetcorn', qty: 150, unit: 'g' },
        { name: 'milk', qty: 500, unit: 'ml' },
        { name: 'flour', qty: 50, unit: 'g' },
        { name: 'butter', qty: 50, unit: 'g' },
        { name: 'cheddar cheese', qty: 200, unit: 'g' },
      ],
    },
    {
      title: 'Chicken Fajitas',
      minutes: 20,
      calories: 420,
      isVegetarian: false,
      isDairyFree: false,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
      instructionsMd: `
# Chicken Fajitas

## Instructions
1. Slice chicken breast into strips
2. Slice bell peppers and onions
3. Heat oil in a large pan
4. Cook chicken until golden
5. Add peppers and onions, cook for 5 minutes
6. Season with paprika, cumin, and chilli powder
7. Warm tortillas and serve with toppings

## Tips
- Quick 20-minute weeknight dinner
- Let everyone build their own fajita
- Top with cheese, yogurt, and salsa
      `.trim(),
      ingredients: [
        { name: 'chicken breast', qty: 600, unit: 'g' },
        { name: 'bell peppers', qty: 300, unit: 'g' },
        { name: 'onions', qty: 150, unit: 'g' },
        { name: 'tortillas', qty: 8, unit: 'pcs' },
        { name: 'olive oil', qty: 30, unit: 'ml' },
        { name: 'paprika', qty: 10, unit: 'g' },
        { name: 'cumin', qty: 5, unit: 'g' },
        { name: 'chilli powder', qty: 5, unit: 'g' },
        { name: 'cheese', qty: 100, unit: 'g' },
        { name: 'yogurt', qty: 150, unit: 'g' },
      ],
    },
    {
      title: 'Lentil & Vegetable Soup',
      minutes: 35,
      calories: 280,
      isVegetarian: true,
      isDairyFree: true,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 6,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
      instructionsMd: `
# Lentil & Vegetable Soup

## Instructions
1. Sauté onions, carrots, and celery
2. Add garlic and cook for 1 minute
3. Add lentils, tinned tomatoes, and stock
4. Add mixed herbs and season
5. Simmer for 25-30 minutes
6. Add spinach and cook until wilted
7. Serve with crusty bread

## Tips
- Budget-friendly and filling
- Perfect for batch cooking
- Freezes well in portions
      `.trim(),
      ingredients: [
        { name: 'lentils', qty: 300, unit: 'g' },
        { name: 'tinned tomatoes', qty: 400, unit: 'g' },
        { name: 'carrots', qty: 200, unit: 'g' },
        { name: 'onions', qty: 150, unit: 'g' },
        { name: 'celery', qty: 100, unit: 'g' },
        { name: 'garlic', qty: 15, unit: 'g' },
        { name: 'spinach', qty: 200, unit: 'g' },
        { name: 'stock cube', qty: 2, unit: 'pcs' },
        { name: 'mixed herbs', qty: 5, unit: 'g' },
        { name: 'bread', qty: 200, unit: 'g' },
      ],
    },
    {
      title: 'Quick Pork Chops with Roast Veg',
      minutes: 30,
      calories: 480,
      isVegetarian: false,
      isDairyFree: true,
      mealTypes: ['dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80',
      instructionsMd: `
# Quick Pork Chops with Roast Veg

## Instructions
1. Preheat oven to 200°C
2. Chop potatoes, carrots, and parsnips
3. Toss vegetables with oil and herbs
4. Roast for 15 minutes
5. Season pork chops and add to tray
6. Roast for 15 more minutes
7. Let rest and serve

## Tips
- Affordable Irish pork from Aldi/Lidl
- One-tray meal for easy cleanup
- Add honey for caramelized vegetables
      `.trim(),
      ingredients: [
        { name: 'pork chops', qty: 600, unit: 'g' },
        { name: 'potatoes', qty: 600, unit: 'g' },
        { name: 'carrots', qty: 300, unit: 'g' },
        { name: 'parsnips', qty: 200, unit: 'g' },
        { name: 'olive oil', qty: 40, unit: 'ml' },
        { name: 'mixed herbs', qty: 5, unit: 'g' },
        { name: 'honey', qty: 20, unit: 'g' },
      ],
    },
    {
      title: 'Creamy Chicken & Mushroom Pasta',
      minutes: 25,
      calories: 520,
      isVegetarian: false,
      isDairyFree: false,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80',
      instructionsMd: `
# Creamy Chicken & Mushroom Pasta

## Instructions
1. Cook pasta according to package directions
2. Cut chicken into bite-sized pieces
3. Fry chicken until golden, set aside
4. Sauté mushrooms and garlic in butter
5. Add cream and cheese, stir until melted
6. Add chicken back to pan
7. Toss with drained pasta and serve

## Tips
- Quick weeknight comfort food
- Use cream from Aldi for best value
- Add spinach for extra nutrition
      `.trim(),
      ingredients: [
        { name: 'pasta', qty: 400, unit: 'g' },
        { name: 'chicken breast', qty: 500, unit: 'g' },
        { name: 'mushrooms', qty: 300, unit: 'g' },
        { name: 'cream', qty: 250, unit: 'ml' },
        { name: 'cheese', qty: 100, unit: 'g' },
        { name: 'garlic', qty: 10, unit: 'g' },
        { name: 'butter', qty: 30, unit: 'g' },
        { name: 'spinach', qty: 100, unit: 'g' },
      ],
    },
    {
      title: 'Veggie Chilli with Rice',
      minutes: 35,
      calories: 380,
      isVegetarian: true,
      isDairyFree: true,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 6,
      imageUrl: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=600&q=80',
      instructionsMd: `
# Veggie Chilli with Rice

## Instructions
1. Cook rice according to package directions
2. Sauté onions, peppers, and garlic
3. Add tinned tomatoes and kidney beans
4. Add chilli powder, cumin, and paprika
5. Simmer for 20 minutes
6. Season and serve over rice

## Tips
- Batch cook for easy lunches
- Freezer-friendly portions
- Top with yogurt and cheese
      `.trim(),
      ingredients: [
        { name: 'kidney beans', qty: 800, unit: 'g' },
        { name: 'tinned tomatoes', qty: 800, unit: 'g' },
        { name: 'bell peppers', qty: 300, unit: 'g' },
        { name: 'onions', qty: 200, unit: 'g' },
        { name: 'garlic', qty: 15, unit: 'g' },
        { name: 'rice', qty: 400, unit: 'g' },
        { name: 'chilli powder', qty: 10, unit: 'g' },
        { name: 'cumin', qty: 10, unit: 'g' },
        { name: 'paprika', qty: 10, unit: 'g' },
        { name: 'olive oil', qty: 30, unit: 'ml' },
      ],
    },
    {
      title: 'Chicken Noodle Stir-Fry',
      minutes: 18,
      calories: 410,
      isVegetarian: false,
      isDairyFree: true,
      mealTypes: ['lunch', 'dinner'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
      instructionsMd: `
# Chicken Noodle Stir-Fry

## Instructions
1. Cook noodles according to package directions
2. Slice chicken into thin strips
3. Heat oil in wok over high heat
4. Cook chicken until golden
5. Add vegetables and stir-fry for 3 minutes
6. Add noodles and soy sauce
7. Toss everything together and serve

## Tips
- Ready in under 20 minutes
- Use whatever vegetables you have
- Great for weeknight dinners
      `.trim(),
      ingredients: [
        { name: 'noodles', qty: 400, unit: 'g' },
        { name: 'chicken breast', qty: 500, unit: 'g' },
        { name: 'bell peppers', qty: 200, unit: 'g' },
        { name: 'broccoli', qty: 200, unit: 'g' },
        { name: 'carrots', qty: 150, unit: 'g' },
        { name: 'onions', qty: 100, unit: 'g' },
        { name: 'garlic', qty: 10, unit: 'g' },
        { name: 'soy sauce', qty: 50, unit: 'ml' },
        { name: 'vegetable oil', qty: 30, unit: 'ml' },
      ],
    },
    {
      title: 'Classic Irish Porridge',
      minutes: 10,
      calories: 280,
      isVegetarian: true,
      isDairyFree: false,
      mealTypes: ['breakfast'],
      servingsDefault: 2,
      imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600&q=80',
      instructionsMd: `
# Classic Irish Porridge

## Instructions
1. Bring milk and water to a gentle simmer
2. Stir in oats and reduce heat to low
3. Cook for 5-7 minutes, stirring occasionally
4. Add a pinch of salt
5. Serve topped with honey, berries, and cream

## Tips
- Use traditional Irish oats for authentic flavor
- Adjust milk-to-water ratio for desired thickness
- Can top with banana, nuts, or dried fruit
      `.trim(),
      ingredients: [
        { name: 'oats', qty: 100, unit: 'g' },
        { name: 'milk', qty: 300, unit: 'ml' },
        { name: 'honey', qty: 20, unit: 'g' },
        { name: 'berries', qty: 100, unit: 'g' },
        { name: 'cream', qty: 50, unit: 'ml' },
      ],
    },
    {
      title: 'Scrambled Eggs on Toast',
      minutes: 8,
      calories: 320,
      isVegetarian: true,
      isDairyFree: false,
      mealTypes: ['breakfast'],
      servingsDefault: 2,
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80',
      instructionsMd: `
# Scrambled Eggs on Toast

## Instructions
1. Toast bread until golden brown
2. Beat eggs with milk, salt, and pepper
3. Melt butter in a non-stick pan over medium heat
4. Pour in eggs and stir gently
5. Cook until just set but still creamy
6. Serve immediately on buttered toast

## Tips
- Don't overcook - remove from heat while still slightly runny
- Add herbs like chives or parsley for extra flavor
- Use quality bread for best results
      `.trim(),
      ingredients: [
        { name: 'eggs', qty: 4, unit: 'pcs' },
        { name: 'bread', qty: 4, unit: 'pcs' },
        { name: 'butter', qty: 30, unit: 'g' },
        { name: 'milk', qty: 50, unit: 'ml' },
      ],
    },
    {
      title: 'Full Irish Breakfast',
      minutes: 25,
      calories: 650,
      isVegetarian: false,
      isDairyFree: false,
      mealTypes: ['breakfast'],
      servingsDefault: 2,
      imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80',
      instructionsMd: `
# Full Irish Breakfast

## Instructions
1. Grill or fry sausages until cooked through
2. Fry bacon until crispy
3. Fry eggs to your liking
4. Grill or fry tomatoes cut in half
5. Warm beans in a small pot
6. Toast bread and butter generously
7. Serve everything together while hot

## Tips
- Traditional Irish breakfast staple
- Can add black and white pudding if available
- Perfect weekend breakfast
      `.trim(),
      ingredients: [
        { name: 'sausages', qty: 4, unit: 'pcs' },
        { name: 'bacon', qty: 200, unit: 'g' },
        { name: 'eggs', qty: 4, unit: 'pcs' },
        { name: 'tomatoes', qty: 2, unit: 'pcs' },
        { name: 'baked beans', qty: 200, unit: 'g' },
        { name: 'bread', qty: 4, unit: 'pcs' },
        { name: 'butter', qty: 30, unit: 'g' },
      ],
    },
    {
      title: 'Buttermilk Pancakes with Maple Syrup',
      minutes: 15,
      calories: 380,
      isVegetarian: true,
      isDairyFree: false,
      mealTypes: ['breakfast'],
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
      instructionsMd: `
# Buttermilk Pancakes with Maple Syrup

## Instructions
1. Mix flour, sugar, baking powder, and salt in a bowl
2. In another bowl, whisk buttermilk, eggs, and melted butter
3. Combine wet and dry ingredients until just mixed
4. Heat a non-stick pan over medium heat
5. Pour 1/4 cup batter per pancake
6. Cook until bubbles form, then flip
7. Cook until golden brown
8. Serve with maple syrup and butter

## Tips
- Don't overmix the batter - lumps are okay
- Let batter rest 5 minutes for fluffier pancakes
- Keep warm in low oven while cooking batches
      `.trim(),
      ingredients: [
        { name: 'flour', qty: 250, unit: 'g' },
        { name: 'buttermilk', qty: 300, unit: 'ml' },
        { name: 'eggs', qty: 2, unit: 'pcs' },
        { name: 'butter', qty: 50, unit: 'g' },
        { name: 'sugar', qty: 30, unit: 'g' },
        { name: 'baking powder', qty: 10, unit: 'g' },
        { name: 'maple syrup', qty: 100, unit: 'ml' },
      ],
    },
    {
      title: 'Avocado Toast with Poached Egg',
      minutes: 10,
      calories: 340,
      isVegetarian: true,
      isDairyFree: true,
      mealTypes: ['breakfast'],
      servingsDefault: 2,
      imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&q=80',
      instructionsMd: `
# Avocado Toast with Poached Egg

## Instructions
1. Toast bread until golden and crispy
2. Bring water to gentle simmer for poaching
3. Crack eggs into simmering water
4. Poach for 3-4 minutes until whites set
5. Mash avocado with lemon juice, salt, and pepper
6. Spread avocado on toast
7. Top with poached egg
8. Season with chili flakes if desired

## Tips
- Use ripe but firm avocados
- Add a splash of vinegar to poaching water
- Can add cherry tomatoes or feta
      `.trim(),
      ingredients: [
        { name: 'bread', qty: 4, unit: 'pcs' },
        { name: 'avocado', qty: 2, unit: 'pcs' },
        { name: 'eggs', qty: 4, unit: 'pcs' },
        { name: 'lemon juice', qty: 10, unit: 'ml' },
        { name: 'chili flakes', qty: 2, unit: 'g' },
      ],
    },
    {
      title: 'Greek Yogurt Parfait with Granola',
      minutes: 5,
      calories: 310,
      isVegetarian: true,
      isDairyFree: false,
      mealTypes: ['breakfast'],
      servingsDefault: 2,
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80',
      instructionsMd: `
# Greek Yogurt Parfait with Granola

## Instructions
1. Layer Greek yogurt in glass or bowl
2. Add layer of mixed berries
3. Sprinkle granola on top
4. Drizzle with honey
5. Add another layer if desired
6. Top with fresh berries

## Tips
- Use full-fat Greek yogurt for richness
- Make granola ahead for quick assembly
- Can prep in jars the night before
      `.trim(),
      ingredients: [
        { name: 'greek yogurt', qty: 400, unit: 'g' },
        { name: 'granola', qty: 100, unit: 'g' },
        { name: 'berries', qty: 200, unit: 'g' },
        { name: 'honey', qty: 30, unit: 'g' },
        { name: 'nuts', qty: 50, unit: 'g' },
      ],
    },
    {
      title: 'French Toast with Berries',
      minutes: 12,
      calories: 390,
      isVegetarian: true,
      isDairyFree: false,
      mealTypes: ['breakfast'],
      servingsDefault: 2,
      imageUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80',
      instructionsMd: `
# French Toast with Berries

## Instructions
1. Beat eggs with milk, vanilla, and cinnamon
2. Dip bread slices in egg mixture
3. Heat butter in a pan over medium heat
4. Cook bread until golden on both sides
5. Dust with icing sugar
6. Top with fresh berries
7. Drizzle with maple syrup

## Tips
- Use day-old bread for best texture
- Don't oversoak the bread
- Serve immediately while hot
      `.trim(),
      ingredients: [
        { name: 'bread', qty: 6, unit: 'pcs' },
        { name: 'eggs', qty: 3, unit: 'pcs' },
        { name: 'milk', qty: 150, unit: 'ml' },
        { name: 'butter', qty: 40, unit: 'g' },
        { name: 'berries', qty: 150, unit: 'g' },
        { name: 'cinnamon', qty: 3, unit: 'g' },
        { name: 'vanilla extract', qty: 5, unit: 'ml' },
        { name: 'maple syrup', qty: 60, unit: 'ml' },
      ],
    },
    {
      title: 'Breakfast Smoothie Bowl',
      minutes: 7,
      calories: 290,
      isVegetarian: true,
      isDairyFree: true,
      mealTypes: ['breakfast'],
      servingsDefault: 2,
      imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
      instructionsMd: `
# Breakfast Smoothie Bowl

## Instructions
1. Blend frozen banana with berries and milk
2. Add protein powder if desired
3. Blend until thick and smooth
4. Pour into bowl
5. Top with granola, fresh fruit, and seeds
6. Drizzle with honey or nut butter

## Tips
- Use frozen fruit for thick consistency
- Adjust liquid for desired thickness
- Customize toppings to your preference
      `.trim(),
      ingredients: [
        { name: 'banana', qty: 2, unit: 'pcs' },
        { name: 'berries', qty: 200, unit: 'g' },
        { name: 'almond milk', qty: 200, unit: 'ml' },
        { name: 'granola', qty: 80, unit: 'g' },
        { name: 'chia seeds', qty: 20, unit: 'g' },
        { name: 'honey', qty: 20, unit: 'g' },
      ],
    },
  ];

  for (const recipeData of recipes) {
    const { ingredients: recipeIngredients, ...recipeInfo } = recipeData;

    // Validate mealTypes before creating recipe
    const validatedMealTypes = validateMealTypes(recipeInfo.mealTypes, recipeInfo.title);

    const recipe = await prisma.recipe.create({
      data: {
        ...recipeInfo,
        mealTypes: validatedMealTypes,
      },
    });

    // Create recipe ingredients
    await Promise.all(
      recipeIngredients.map((ing) => {
        const ingredientId = ingredientMap.get(ing.name);
        if (!ingredientId) {
          throw new Error(
            `Ingredient "${ing.name}" not found in ingredientMap. Data inconsistency detected.`
          );
        }
        return prisma.recipeIngredient.create({
          data: {
            recipeId: recipe.id,
            ingredientId,
            quantity: ing.qty,
            unit: ing.unit,
          },
        });
      })
    );
  }

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
