import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    await prisma.mealPlanItem.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.pantryItem.deleteMany();
    await prisma.recipeIngredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.ingredient.deleteMany();
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
    // Dairy
    { name: 'milk', category: 'dairy' },
    { name: 'cheese', category: 'dairy' },
    { name: 'butter', category: 'dairy' },
    { name: 'yogurt', category: 'dairy' },
    // Grains
    { name: 'rice', category: 'grains' },
    { name: 'pasta', category: 'grains' },
    { name: 'bread', category: 'grains' },
    { name: 'flour', category: 'grains' },
    // Pantry
    { name: 'olive oil', category: 'pantry' },
    { name: 'soy sauce', category: 'pantry' },
    { name: 'coconut milk', category: 'pantry' },
    { name: 'curry paste', category: 'pantry' },
    { name: 'tomato paste', category: 'pantry' },
    { name: 'stock cube', category: 'pantry' },
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
      servingsDefault: 4,
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
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
  ];

  for (const recipeData of recipes) {
    const { ingredients: recipeIngredients, ...recipeInfo } = recipeData;

    const recipe = await prisma.recipe.create({
      data: recipeInfo,
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

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
