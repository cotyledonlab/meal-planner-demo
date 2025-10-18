# Meal Planning Feature Documentation

## Overview

The meal planning feature allows users to generate personalized weekly meal plans based on their preferences, with an automatically generated shopping list that includes price estimates from Irish grocery stores.

## Features Implemented

### 1. Database Schema

The following models have been added to support meal planning:

- **UserPreferences**: Stores user preferences (household size, meals per day, dietary restrictions, dislikes)
- **Recipe**: Contains recipe details (title, cooking time, calories, dietary flags, instructions)
- **Ingredient**: Catalog of ingredients with categories
- **RecipeIngredient**: Links recipes to ingredients with quantities
- **MealPlan**: User's meal plan with start date and duration
- **MealPlanItem**: Individual meals within a plan (day, meal type, recipe, servings)
- **PantryItem**: User's existing pantry items to subtract from shopping lists
- **PriceBaseline**: Price estimates per ingredient category and store

### 2. Seed Data

The database comes pre-populated with:

- **12 recipes** covering various cuisines and dietary preferences:
  - 3 vegetarian recipes
  - 2 dairy-free recipes
  - Mix of quick (15-20 min) and longer (45-60 min) preparation times
  - Variety of protein sources and meal types
- **29 ingredients** across 5 categories (protein, vegetables, dairy, grains, pantry)
- **Price baselines** for 4 Irish stores (Aldi, Lidl, Tesco, Dunnes)

Run seed command:

```bash
pnpm db:seed
```

### 3. Backend API (tRPC)

Three main routers have been implemented:

#### Preferences Router

- `get`: Retrieve user preferences (or defaults)
- `update`: Update user preferences

#### Meal Plan Router

- `getCurrent`: Get the user's most recent meal plan
- `generate`: Generate a new meal plan based on preferences
  - Rule-based algorithm filters recipes by dietary restrictions
  - Filters out recipes with disliked ingredients
  - Rotates recipes for variety
  - Scales servings to household size
- `delete`: Delete a meal plan

#### Shopping List Router

- `getForMealPlan`: Generate aggregated shopping list for a meal plan
  - Aggregates all ingredients across recipes
  - Scales quantities by servings
  - Subtracts pantry items (if any)
  - Groups by ingredient category
  - Calculates price estimates per store
  - Identifies cheapest store
- `exportCSV`: Export shopping list as CSV

### 4. Unit Converter

Utility functions for normalizing recipe measurements:

- Converts various units (tsp, tbsp, cups, oz, lb) to normalized units (g, ml, pcs)
- Aggregates ingredients in compatible units
- Formats quantities for display

### 5. Frontend

#### Meal Plan Wizard

Updated wizard with all required fields:

- Household size (1-6 people)
- Meals per day (1-3)
- Planning duration (3-7 days)
- Dietary preferences (Vegetarian, Dairy-free)
- Foods to avoid (comma-separated list)

#### Meal Plan View

Displays generated meal plan with:

- Recipe cards with images, cook time, and calories
- Day and meal type labels
- Dietary preference badges
- Navigation to shopping list

#### Shopping List View

Shows aggregated shopping list with:

- Items grouped by category
- Quantities in normalized units
- Price comparison across stores
- Cheapest store recommendation
- CSV export button

## Usage Flow

1. User navigates to `/planner` (requires authentication)
2. User fills out preferences in the wizard
3. System generates meal plan using rule-based algorithm
4. User reviews meal plan with recipe cards
5. User clicks "View Shopping List"
6. System aggregates ingredients and calculates prices
7. User can export shopping list as CSV

## Technical Details

### Rule-Based Meal Plan Generation

The algorithm follows these rules:

1. **Filter by dietary preferences**:
   - If vegetarian: only show vegetarian recipes
   - If dairy-free: only show dairy-free recipes

2. **Filter by dislikes**:
   - Check each recipe's ingredients
   - Exclude recipes containing disliked ingredients

3. **Rotate recipes for variety**:
   - Use round-robin selection
   - Ensure different meals across days

4. **Scale servings**:
   - Adjust recipe quantities based on household size

### Price Estimation

Price estimates are category-based (not SKU-based):

- Each ingredient belongs to a category (protein, vegetables, dairy, grains, pantry)
- Price baselines store average price per unit for each category at each store
- Total cost = sum of (quantity × category price per unit) for all ingredients
- Stores ranked by total cost to identify cheapest option

**Note**: This is a rough estimate for demo purposes. Production would use real-time pricing data.

### Unit Normalization

All quantities are normalized to:

- **Weight**: grams (g)
- **Volume**: milliliters (ml)
- **Count**: pieces (pcs)

Conversion rules are defined in `src/lib/unitConverter.ts`.

## Database Migrations

The meal planning models are added via migration:

```
20251017235932_add_meal_planning_models
```

To apply migrations:

```bash
pnpm db:migrate  # Production
pnpm db:push     # Development
```

## Environment Variables

Required environment variables:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/meal-planner-demo
```

For local development, use docker-compose:

```bash
docker compose up -d postgres
```

## Testing

Current test coverage:

- Unit tests for existing routers pass
- Manual testing verified wizard flow and UI
- Integration tests for meal plan and shopping list routers should be added

To run tests:

```bash
pnpm test
```

## Future Enhancements

Nice-to-have features not included in v1:

- Swap recipe functionality with search and filters
- Pantry management UI
- PDF export for shopping lists
- Shareable public links for meal plans
- AI-powered recipe suggestions
- Macro targeting and nutritional analysis
- Recipe difficulty ratings
- Ingredient substitution suggestions
- Multi-week planning

## API Examples

### Generate a meal plan

```typescript
const mealPlan = await api.mealPlan.generate.mutate({
  householdSize: 2,
  mealsPerDay: 1,
  days: 7,
  isVegetarian: false,
  isDairyFree: true,
  dislikes: "mushrooms, olives",
});
```

### Get shopping list

```typescript
const shoppingList = await api.shoppingList.getForMealPlan.query({
  mealPlanId: mealPlan.id,
});
```

### Export CSV

```typescript
const csv = await api.shoppingList.exportCSV.query({
  mealPlanId: mealPlan.id,
});
// csv.csv contains the CSV content
```

## Known Limitations

1. **Authentication required**: Users must be logged in to use the meal planner
2. **Limited recipe database**: Only 12 recipes in seed data (can be expanded)
3. **No recipe swapping**: Users cannot swap individual recipes in the plan
4. **Static price data**: Price baselines are not connected to live store data
5. **No pantry UI**: Pantry items must be added directly to database
6. **CSV export**: No PDF or print-optimized view yet
7. **Single currency**: Prices are in EUR only

## Support

For issues or questions, refer to:

- Main README: `/README.md`
- Contributing guidelines: `/CONTRIBUTING.md`
- Issue tracker: GitHub Issues
