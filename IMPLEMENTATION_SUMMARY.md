# Meal Planner Implementation Summary

## Overview

This document summarizes the implementation of the real meal planner functionality, replacing mock data with a database-backed system that generates actual meal plans and shopping lists.

## What Was Implemented

### 1. Database Schema Updates

**New Models:**

- Added `role` field to `User` model (`'basic'` | `'premium'`)
- `ShoppingList` - Stores aggregated shopping lists per meal plan
- `ShoppingListItem` - Individual items in a shopping list

**Updated Models:**

- `User` now has a `role` field for premium tier differentiation
- `MealPlan` has a relation to `ShoppingList`

**Migration:** `20251019130239_add_user_role_and_shopping_lists`

### 2. Backend Services

**PlanGenerator Service** (`src/server/services/planGenerator.ts`)

- Generates meal plans based on user role:
  - Basic users: 3-day plans
  - Premium users: 7-day plans
- Creates 3 meals per day (breakfast, lunch, dinner)
- Randomly selects recipes from the database for variety
- Creates nested structure: MealPlan → MealPlanItems
- Automatically triggers shopping list creation

**ShoppingListService** (`src/server/services/shoppingList.ts`)

- Aggregates ingredients across all plan items
- Normalizes units using the unit converter
- Combines like ingredients (e.g., "200g tomatoes" + "100g tomatoes" = "300g tomatoes")
- Stores shopping list in database for later retrieval
- Handles incompatible unit conversions gracefully

### 3. API Layer (tRPC Routers)

**Plan Router** (`src/server/api/routers/plan.ts`)

- `plan.generate` - Creates a new meal plan for the authenticated user
- `plan.getById` - Retrieves a specific meal plan with all nested data
- `plan.getLast` - Gets the most recent meal plan for a user

**Shopping List Router** (updated `src/server/api/routers/shoppingList.ts`)

- `shoppingList.getForPlan` - Retrieves the stored shopping list for a plan

### 4. UI Components

**Updated Components:**

- `MealPlanWizard` - Now closable via X button, overlay click, and ESC key
- `PremiumPreviewModal` - Added overlay click and ESC key support
- `MealPlanView` - Refactored to accept real plan data from API
- `ShoppingList` - Refactored to display aggregated items with quantities

**New Pages:**

- `/plan/[id]` - Displays a specific meal plan with its shopping list
- `/planner/last` - Redirects to the user's most recent meal plan
- Updated `/planner` - Simplified to show wizard and redirect to generated plan

### 5. Test Data & Seeding

**Seed Script Updates** (`apps/web/prisma/seed.ts`)

- Creates two test users with hashed passwords:
  - **Premium**: `premium@example.com` / `P@ssw0rd!` (role: 'premium')
  - **Basic**: `basic@example.com` / `P@ssw0rd!` (role: 'basic')
- Seeds 12 diverse recipes covering various cuisines and dietary preferences
- Each recipe includes complete ingredient lists with quantities and units

**Run the seed:**

```bash
cd apps/web && pnpm prisma db seed
```

### 6. User Flow

**New Meal Plan Generation:**

1. User clicks "Create New Plan" or visits `/planner`
2. `MealPlanWizard` modal appears
3. User completes wizard (preferences currently ignored, uses role-based logic)
4. System generates plan based on user role (3 or 7 days)
5. Shopping list is automatically created and stored
6. User is redirected to `/plan/[id]` showing their new plan

**View Last Plan:**

1. User clicks "View Last Plan" from dashboard or home
2. Navigates to `/planner/last`
3. System looks up most recent plan
4. Redirects to `/plan/[id]`
5. If no plan exists, redirects to `/planner` to create one

### 7. Premium vs Basic Differences

| Feature          | Basic                        | Premium                      |
| ---------------- | ---------------------------- | ---------------------------- |
| Plan Length      | 3 days                       | 7 days                       |
| Meals per Day    | 3 (breakfast, lunch, dinner) | 3 (breakfast, lunch, dinner) |
| Shopping List    | ✅ Included                  | ✅ Included                  |
| Price Comparison | ❌ Not available             | ✅ Available (preview)       |

## Technical Details

### Role-Based Gating

The plan generator checks the user's role and limits plan length:

```typescript
const days = user.role === "premium" ? 7 : 3;
```

### Shopping List Aggregation

The shopping list service:

1. Iterates through all meal plan items
2. Scales ingredient quantities based on servings
3. Normalizes units (e.g., tsp → ml, oz → g)
4. Combines ingredients with matching normalized units
5. Rounds quantities to 1 decimal place
6. Stores results in `ShoppingListItem` records

### Unit Conversion

Uses `convertToNormalizedUnit` from `lib/unitConverter.ts`:

- Weight conversions → grams (g)
- Volume conversions → milliliters (ml)
- Count items → pieces (pcs)

Supports: g, kg, oz, lb, ml, l, tsp, tbsp, cup, fl oz, pcs, etc.

## Files Changed

### Created:

- `/apps/web/src/server/services/planGenerator.ts`
- `/apps/web/src/server/services/shoppingList.ts`
- `/apps/web/src/server/api/routers/plan.ts`
- `/apps/web/src/app/plan/[id]/page.tsx`
- `/apps/web/src/app/planner/last/page.tsx`

### Modified:

- `/apps/web/prisma/schema.prisma` - Added role and shopping list models
- `/apps/web/prisma/seed.ts` - Added test users and enhanced recipes
- `/apps/web/src/server/api/root.ts` - Registered plan router
- `/apps/web/src/server/api/routers/shoppingList.ts` - Added getForPlan
- `/apps/web/src/app/_components/MealPlanWizard.tsx` - Made closable
- `/apps/web/src/app/_components/PremiumPreviewModal.tsx` - Added ESC/overlay close
- `/apps/web/src/app/_components/MealPlanView.tsx` - Support real plan data
- `/apps/web/src/app/_components/ShoppingList.tsx` - Display aggregated items
- `/apps/web/src/app/planner/page.tsx` - Simplified to wizard → redirect flow
- `/apps/web/README.md` - Added test credentials

## Testing

### Manual Testing Steps

1. **Basic User Flow:**

   ```bash
   # Login as basic@example.com / P@ssw0rd!
   # Click "Create New Plan"
   # Complete wizard
   # Verify 3-day plan is generated
   # Check shopping list shows aggregated ingredients
   ```

2. **Premium User Flow:**

   ```bash
   # Login as premium@example.com / P@ssw0rd!
   # Click "Create New Plan"
   # Complete wizard
   # Verify 7-day plan is generated
   # Check shopping list shows all ingredients
   ```

3. **View Last Plan:**

   ```bash
   # After creating a plan, navigate away
   # Click "View Last Plan"
   # Verify you see your most recent plan
   ```

4. **Modal Interactions:**
   ```bash
   # Open wizard, press ESC → should close
   # Open wizard, click overlay → should close
   # Open premium modal, test all close methods
   ```

### Quality Checks Run

✅ **TypeScript**: All types resolved, no errors  
✅ **ESLint**: Only minor warnings (unused params with underscore prefix)  
✅ **Prisma**: Client generated successfully, migrations applied  
✅ **Seed**: Test users and recipes created successfully

## Future Enhancements

### Near-term (mentioned in plan but not yet implemented):

- Wire wizard preferences to filter recipes (vegetarian, dairy-free, dislikes)
- Add dietary tag filtering in plan generator
- Implement AI-powered recipe generation batch job
- Add recipe detail pages with full instructions
- Allow editing/swapping recipes in generated plans

### Long-term:

- Recipe favoriting and history
- Pantry management integration (subtract owned ingredients)
- Multi-week planning
- Collaborative planning (family accounts)
- Export to calendar/reminders
- Grocery delivery integration

## Known Limitations

1. **Preferences Not Used**: The wizard collects preferences but they're currently ignored. Plan generation is purely role-based until filtering logic is added.

2. **No Recipe Repeats Prevention**: If the recipe pool is small, the same recipe may appear multiple times in a plan.

3. **Fixed Meal Types**: Always generates breakfast, lunch, dinner. No option for "dinner-only" or custom meal types yet.

4. **No Plan Editing**: Once generated, plans cannot be modified. Users must regenerate to get different recipes.

5. **Simple Randomization**: Recipes are shuffled randomly without considering variety, nutrition balance, or user history.

## Troubleshooting

### Seed Fails

```bash
# Ensure database is running
docker compose up -d postgres

# Check connection
cd apps/web && pnpm prisma db push

# Re-run seed
pnpm prisma db seed
```

### Type Errors After Schema Changes

```bash
# Regenerate Prisma client
cd apps/web && pnpm prisma generate
```

### Shopping List Items Missing

The shopping list is created automatically when a plan is generated. If missing:

1. Check that `buildAndStoreForPlan` is called in plan generator
2. Verify `ShoppingList` and `ShoppingListItem` records exist in DB
3. Check `convertToNormalizedUnit` doesn't throw for ingredient units

## Conclusion

The meal planner now generates real, database-backed meal plans with proper role-based gating and auto-generated shopping lists. The system is ready for:

- User testing with premium/basic accounts
- Integration of AI recipe generation
- Addition of preference-based filtering
- Further UI/UX enhancements

All core requirements from the implementation plan have been met:
✅ Closable modals
✅ Real plan generation from DB
✅ Shopping list aggregation and storage
✅ View Last Plan navigation
✅ Premium and basic test logins
