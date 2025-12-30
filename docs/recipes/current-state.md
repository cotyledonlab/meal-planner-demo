# Recipe & Meal Plan Flow - Current State

This document describes the current implementation of recipes, meal plans, and shopping lists in MealMind.

## Overview

MealMind uses a **pre-seeded recipe database** with AI-powered meal plan generation. Users configure their preferences through a wizard, and the system generates personalized meal plans by selecting from existing recipes.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  MealPlanWizard          MealPlanView            ShoppingList           │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐         │
│  │ Preferences │───────▶│ Daily Meals │───────▶│ Aggregated  │         │
│  │ Collection  │        │ Display     │        │ Ingredients │         │
│  └─────────────┘        └─────────────┘        └─────────────┘         │
└────────────┬────────────────────┬────────────────────┬──────────────────┘
             │                    │                    │
             ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            tRPC API LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  plan.generate           mealPlan.getById        shoppingList.getByPlan │
│  preferences.get/set     mealPlan.listForUser                           │
└────────────┬────────────────────┬────────────────────┬──────────────────┘
             │                    │                    │
             ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  PlanGenerator                                                           │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │ 1. Load user preferences                                      │       │
│  │ 2. Query matching recipes from database                       │       │
│  │ 3. Apply dietary filters (vegetarian, dairy-free)             │       │
│  │ 4. Exclude disliked ingredients                               │       │
│  │ 5. Randomly select recipes for each meal slot                 │       │
│  │ 6. Create MealPlan with MealPlanDay and MealPlanMeal records  │       │
│  │ 7. Generate aggregated ShoppingList                           │       │
│  └──────────────────────────────────────────────────────────────┘       │
└────────────┬────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (PostgreSQL)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Recipe ◄──────── RecipeIngredient ────────► Ingredient                 │
│    │                                              │                      │
│    │                                              │                      │
│    ▼                                              ▼                      │
│  MealPlanMeal ──► MealPlanDay ──► MealPlan   ShoppingListItem           │
│                                       │              │                   │
│                                       └──────────────┘                   │
│                                       ShoppingList                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Models

### Core Entities (Prisma Schema)

#### Recipe

```prisma
model Recipe {
  id            String             @id @default(cuid())
  name          String
  description   String?
  instructions  String             @db.Text
  prepTime      Int                // minutes
  cookTime      Int                // minutes
  servings      Int
  isVegetarian  Boolean            @default(false)
  isDairyFree   Boolean            @default(false)
  cuisineType   String?
  mealType      MealType           // BREAKFAST, LUNCH, DINNER, SNACK
  imageUrl      String?
  ingredients   RecipeIngredient[]
  mealPlanMeals MealPlanMeal[]
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
}
```

#### Ingredient

```prisma
model Ingredient {
  id                String              @id @default(cuid())
  name              String              @unique
  category          IngredientCategory  // PRODUCE, DAIRY, MEAT, etc.
  defaultUnit       String              // "g", "ml", "piece", etc.
  recipes           RecipeIngredient[]
  shoppingListItems ShoppingListItem[]
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
}
```

#### RecipeIngredient (Join Table)

```prisma
model RecipeIngredient {
  id           String     @id @default(cuid())
  recipeId     String
  ingredientId String
  quantity     Float
  unit         String
  recipe       Recipe     @relation(...)
  ingredient   Ingredient @relation(...)
}
```

#### MealPlan

```prisma
model MealPlan {
  id           String         @id @default(cuid())
  userId       String
  name         String
  startDate    DateTime
  endDate      DateTime
  days         MealPlanDay[]
  shoppingList ShoppingList?
  user         User           @relation(...)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}
```

#### MealPlanDay

```prisma
model MealPlanDay {
  id         String         @id @default(cuid())
  mealPlanId String
  date       DateTime
  dayNumber  Int            // 1-7
  meals      MealPlanMeal[]
  mealPlan   MealPlan       @relation(...)
}
```

#### MealPlanMeal

```prisma
model MealPlanMeal {
  id            String      @id @default(cuid())
  mealPlanDayId String
  recipeId      String
  mealType      MealType
  servings      Int
  mealPlanDay   MealPlanDay @relation(...)
  recipe        Recipe      @relation(...)
}
```

#### ShoppingList

```prisma
model ShoppingList {
  id         String             @id @default(cuid())
  mealPlanId String             @unique
  items      ShoppingListItem[]
  mealPlan   MealPlan           @relation(...)
  createdAt  DateTime           @default(now())
  updatedAt  DateTime           @updatedAt
}
```

#### ShoppingListItem

```prisma
model ShoppingListItem {
  id             String       @id @default(cuid())
  shoppingListId String
  ingredientId   String
  quantity       Float
  unit           String
  isChecked      Boolean      @default(false)
  shoppingList   ShoppingList @relation(...)
  ingredient     Ingredient   @relation(...)
}
```

### Enums

```prisma
enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}

enum IngredientCategory {
  PRODUCE
  DAIRY
  MEAT
  SEAFOOD
  GRAINS
  PANTRY
  SPICES
  CONDIMENTS
  BEVERAGES
  FROZEN
  OTHER
}
```

## Seed Data

The application comes pre-seeded with:

- **30 recipes** across all meal types
- **60+ ingredients** categorized appropriately
- Recipes tagged with dietary attributes (vegetarian, dairy-free)

### Sample Recipe Distribution

| Meal Type | Count | Examples                                     |
| --------- | ----- | -------------------------------------------- |
| BREAKFAST | 8     | Overnight Oats, Avocado Toast, Smoothie Bowl |
| LUNCH     | 10    | Caesar Salad, Chicken Wrap, Quinoa Bowl      |
| DINNER    | 10    | Grilled Salmon, Pasta Primavera, Stir-fry    |
| SNACK     | 2     | Energy Balls, Hummus & Veggies               |

### Ingredient Categories

| Category | Examples                            |
| -------- | ----------------------------------- |
| PRODUCE  | Spinach, Tomatoes, Avocado, Berries |
| DAIRY    | Milk, Cheese, Yogurt, Butter        |
| MEAT     | Chicken Breast, Ground Beef, Bacon  |
| SEAFOOD  | Salmon, Shrimp, Tuna                |
| GRAINS   | Rice, Quinoa, Oats, Pasta           |
| PANTRY   | Olive Oil, Honey, Maple Syrup       |
| SPICES   | Salt, Pepper, Cumin, Paprika        |

## API Layer (tRPC Routers)

### plan.ts - Plan Generation

```typescript
// POST /api/trpc/plan.generate
input: {
  householdSize: number; // 1-6
  mealsPerDay: number; // 1-3
  days: number; // 1-7 (3 max for free users)
  isVegetarian: boolean;
  isDairyFree: boolean;
  dislikes: string; // comma-separated ingredients
}

output: {
  mealPlanId: string;
}
```

### mealPlan.ts - Plan Retrieval

```typescript
// GET /api/trpc/mealPlan.getById
input: { id: string }
output: MealPlan with days, meals, and recipes

// GET /api/trpc/mealPlan.listForUser
output: MealPlan[] for current user
```

### shoppingList.ts - Shopping List

```typescript
// GET /api/trpc/shoppingList.getByPlanId
input: { mealPlanId: string }
output: ShoppingList with items and ingredients

// POST /api/trpc/shoppingList.toggleItem
input: { itemId: string }
output: Updated ShoppingListItem
```

### preferences.ts - User Preferences

```typescript
// GET /api/trpc/preferences.get
output: UserPreferences or null

// POST /api/trpc/preferences.set
input: UserPreferences
output: Updated preferences
```

## PlanGenerator Service

Location: `apps/web/src/server/services/planGenerator.ts`

### Generation Algorithm

```typescript
async function generateMealPlan(userId: string, options: PlanOptions) {
  // 1. Build recipe query with dietary filters
  const where = {
    isVegetarian: options.isVegetarian ? true : undefined,
    isDairyFree: options.isDairyFree ? true : undefined,
    // Exclude recipes containing disliked ingredients
    NOT: {
      ingredients: {
        some: {
          ingredient: {
            name: { in: dislikedIngredients },
          },
        },
      },
    },
  };

  // 2. Fetch recipes grouped by meal type
  const breakfastRecipes = await prisma.recipe.findMany({
    where: { ...where, mealType: "BREAKFAST" },
  });
  const lunchRecipes = await prisma.recipe.findMany({
    where: { ...where, mealType: "LUNCH" },
  });
  const dinnerRecipes = await prisma.recipe.findMany({
    where: { ...where, mealType: "DINNER" },
  });

  // 3. Create meal plan structure
  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId,
      name: `Meal Plan - ${formatDate(startDate)}`,
      startDate,
      endDate,
      days: {
        create: Array.from({ length: options.days }, (_, i) => ({
          date: addDays(startDate, i),
          dayNumber: i + 1,
          meals: {
            create: generateMealsForDay(options.mealsPerDay, recipes),
          },
        })),
      },
    },
  });

  // 4. Generate shopping list by aggregating ingredients
  await generateShoppingList(mealPlan.id);

  return mealPlan;
}
```

### Shopping List Generation

```typescript
async function generateShoppingList(mealPlanId: string) {
  // 1. Get all meals in the plan
  const meals = await prisma.mealPlanMeal.findMany({
    where: { mealPlanDay: { mealPlanId } },
    include: { recipe: { include: { ingredients: true } } },
  });

  // 2. Aggregate ingredients across all meals
  const ingredientMap = new Map<string, { quantity: number; unit: string }>();

  for (const meal of meals) {
    for (const ri of meal.recipe.ingredients) {
      const existing = ingredientMap.get(ri.ingredientId);
      if (existing && existing.unit === ri.unit) {
        existing.quantity +=
          ri.quantity * (meal.servings / meal.recipe.servings);
      } else {
        ingredientMap.set(ri.ingredientId, {
          quantity: ri.quantity * (meal.servings / meal.recipe.servings),
          unit: ri.unit,
        });
      }
    }
  }

  // 3. Create shopping list with items
  await prisma.shoppingList.create({
    data: {
      mealPlanId,
      items: {
        create: Array.from(ingredientMap.entries()).map(
          ([ingredientId, data]) => ({
            ingredientId,
            quantity: data.quantity,
            unit: data.unit,
          }),
        ),
      },
    },
  });
}
```

## Frontend Components

### MealPlanWizard

Location: `apps/web/src/app/_components/MealPlanWizard.tsx`

Collects user preferences:

- Household size (1-6 people)
- Meals per day (1-3)
- Planning horizon (1-7 days, 3 max for free tier)
- Dietary restrictions (vegetarian, dairy-free checkboxes)
- Disliked ingredients (free text)

Features:

- Persistent header with MealMind branding
- Progress indicator
- Confirmation dialog on cancel with unsaved changes
- Premium upsell for extended planning (4-7 days)

### MealPlanView

Location: `apps/web/src/app/plan/[id]/page.tsx`

Displays generated meal plan:

- Day-by-day view with meal cards
- Recipe details (name, prep time, cook time)
- Serving size indicators
- Navigation between days

### ShoppingList

Location: `apps/web/src/app/plan/[id]/shopping-list/page.tsx`

Shopping list features:

- Grouped by ingredient category
- Checkbox to mark items as purchased
- Quantity with units
- Persists checked state

## User Flow

```
1. User lands on Dashboard
   └─▶ Clicks "Create New Plan"

2. MealPlanWizard opens
   ├─▶ User configures preferences
   ├─▶ Clicks "Create My Plan"
   └─▶ Loading state shown

3. Backend generates plan
   ├─▶ PlanGenerator filters recipes
   ├─▶ Randomly selects meals
   ├─▶ Creates MealPlan records
   └─▶ Generates ShoppingList

4. Redirect to /plan/[id]
   ├─▶ MealPlanView displays meals
   └─▶ User can view shopping list

5. Shopping List page
   ├─▶ Shows aggregated ingredients
   └─▶ User checks off items while shopping
```

## Current Limitations & Gaps

### Recipe Management

- [ ] No admin UI to add/edit recipes
- [ ] No user-submitted recipes
- [ ] No recipe favoriting/rating
- [ ] No recipe search or browse functionality
- [ ] Recipes are static (seed data only)

### Meal Planning

- [ ] No manual meal swapping within a plan
- [ ] No recipe substitution suggestions
- [ ] No nutritional information or calorie tracking
- [ ] No consideration for ingredient reuse across days
- [ ] Random selection may repeat recipes unnecessarily

### Shopping List

- [ ] No unit conversion (e.g., combining "cups" and "ml")
- [ ] No pantry/inventory tracking
- [ ] No "already have" feature
- [ ] No export to external apps
- [ ] No price estimation

### User Experience

- [ ] No recipe detail pages with full instructions
- [ ] No cooking mode / step-by-step guidance
- [ ] No meal prep suggestions
- [ ] No sharing meal plans with family members
- [ ] No calendar integration

### Premium Features (Planned)

- [ ] Price comparison across stores
- [ ] Nutrition insights
- [ ] Smart substitutions
- [ ] 7-day planning (currently shows "In development")

## Database Queries

### Get Meal Plan with Full Details

```typescript
const mealPlan = await prisma.mealPlan.findUnique({
  where: { id: mealPlanId },
  include: {
    days: {
      orderBy: { dayNumber: "asc" },
      include: {
        meals: {
          include: {
            recipe: {
              include: {
                ingredients: {
                  include: { ingredient: true },
                },
              },
            },
          },
        },
      },
    },
    shoppingList: {
      include: {
        items: {
          include: { ingredient: true },
          orderBy: { ingredient: { category: "asc" } },
        },
      },
    },
  },
});
```

### Get Filtered Recipes

```typescript
const recipes = await prisma.recipe.findMany({
  where: {
    mealType,
    isVegetarian: isVegetarian || undefined,
    isDairyFree: isDairyFree || undefined,
    NOT: {
      ingredients: {
        some: {
          ingredient: {
            name: { in: excludedIngredients, mode: "insensitive" },
          },
        },
      },
    },
  },
  include: {
    ingredients: {
      include: { ingredient: true },
    },
  },
});
```

## Related Files

| File                                       | Purpose                               |
| ------------------------------------------ | ------------------------------------- |
| `prisma/schema.prisma`                     | Database schema definitions           |
| `prisma/seed.ts`                           | Seed data for recipes and ingredients |
| `src/server/services/planGenerator.ts`     | Meal plan generation logic            |
| `src/server/api/routers/plan.ts`           | Plan generation API endpoint          |
| `src/server/api/routers/mealPlan.ts`       | Plan retrieval endpoints              |
| `src/server/api/routers/shoppingList.ts`   | Shopping list endpoints               |
| `src/app/_components/MealPlanWizard.tsx`   | Preference collection UI              |
| `src/app/plan/[id]/page.tsx`               | Meal plan display page                |
| `src/app/plan/[id]/shopping-list/page.tsx` | Shopping list page                    |

## Testing

Tests are located alongside components with `.test.tsx` suffix:

- `MealPlanWizard.test.tsx` - Form behavior, premium limits
- `PremiumFeatureCard.test.tsx` - Premium upsell UI
- `AuthLayout.test.tsx` - Authentication layout

Run tests with:

```bash
pnpm test
```
