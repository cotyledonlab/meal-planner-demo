# Normalized Recipe Schema Specification

This document describes the normalized recipe data model that extends the current schema to support structured steps, detailed nutrition, diet/allergen tagging, status workflow, and image metadata.

## Design Goals

1. **Structured Steps** - Replace markdown blob with explicit `RecipeStep` table for better querying and UI rendering
2. **Nutrition Per Serving** - Comprehensive nutrition data beyond calories
3. **Diet/Allergen Tags** - Flexible tagging system replacing boolean flags
4. **Status/Versioning** - Recipe approval workflow with history tracking
5. **Image Metadata** - Support for AI-generated recipe images with prompts

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              RECIPE CORE                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Recipe ◄──────────────── RecipeStep (1:N, ordered)                          │
│    │                                                                         │
│    ├──────────────────── RecipeIngredient ────► Ingredient                   │
│    │                                                                         │
│    ├──────────────────── RecipeNutrition (1:1)                               │
│    │                                                                         │
│    ├──────────────────── RecipeStatusHistory (1:N)                           │
│    │                                                                         │
│    ├──────────────────── RecipeImage (1:N)                                   │
│    │                                                                         │
│    ├──────────────────── RecipeDietTag ────► DietTag                         │
│    │                                                                         │
│    └──────────────────── RecipeAllergenTag ────► AllergenTag                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## New Enums

### RecipeStatus

Tracks the approval state of a recipe in the content pipeline.

```prisma
enum RecipeStatus {
  DRAFT           // Initial state, not visible to users
  PENDING_REVIEW  // Submitted for review
  APPROVED        // Reviewed and approved for production
  REJECTED        // Rejected during review
  ARCHIVED        // Soft-deleted, hidden from queries
}
```

### RecipeDifficulty

Indicates cooking skill level required.

```prisma
enum RecipeDifficulty {
  EASY            // Beginner-friendly
  MEDIUM          // Some experience needed
  HARD            // Advanced techniques required
}
```

### StepType

Categorizes different types of recipe steps.

```prisma
enum StepType {
  PREP            // Preparation work (chopping, measuring)
  COOK            // Active cooking
  REST            // Passive waiting (marinating, resting)
  ASSEMBLE        // Final assembly/plating
}
```

## New Models

### RecipeStep

Replaces `instructionsMd` with structured, ordered steps.

| Field           | Type          | Description                  |
| --------------- | ------------- | ---------------------------- |
| id              | String (cuid) | Primary key                  |
| recipeId        | String (FK)   | Parent recipe                |
| stepNumber      | Int           | 1-based ordering             |
| stepType        | StepType      | Category of step             |
| instruction     | String (text) | The actual instruction       |
| durationMinutes | Int?          | Estimated time for this step |
| tips            | String?       | Optional tips/notes          |
| imageUrl        | String?       | Optional step image          |
| createdAt       | DateTime      | Auto timestamp               |
| updatedAt       | DateTime      | Auto timestamp               |

**Constraints:**

- Unique on `(recipeId, stepNumber)`
- `stepNumber` >= 1
- `durationMinutes` >= 0 if provided

### RecipeNutrition

Per-serving nutrition information.

| Field         | Type                | Description         |
| ------------- | ------------------- | ------------------- |
| id            | String (cuid)       | Primary key         |
| recipeId      | String (FK, unique) | Parent recipe (1:1) |
| calories      | Int                 | kcal per serving    |
| protein       | Float               | grams per serving   |
| carbohydrates | Float               | grams per serving   |
| fat           | Float               | grams per serving   |
| fiber         | Float?              | grams per serving   |
| sugar         | Float?              | grams per serving   |
| sodium        | Float?              | mg per serving      |
| cholesterol   | Float?              | mg per serving      |
| saturatedFat  | Float?              | grams per serving   |
| createdAt     | DateTime            | Auto timestamp      |
| updatedAt     | DateTime            | Auto timestamp      |

**Constraints:**

- All numeric values >= 0
- One nutrition record per recipe (enforced by unique `recipeId`)

### DietTag

Canonical diet categories.

| Field       | Type            | Description                         |
| ----------- | --------------- | ----------------------------------- |
| id          | String (cuid)   | Primary key                         |
| name        | String (unique) | e.g., "vegetarian", "vegan", "keto" |
| description | String?         | Human-readable description          |
| createdAt   | DateTime        | Auto timestamp                      |

**Seed values:** vegetarian, vegan, pescatarian, keto, paleo, low-carb, gluten-free, dairy-free, halal, kosher

### AllergenTag

Common food allergens.

| Field       | Type            | Description                     |
| ----------- | --------------- | ------------------------------- |
| id          | String (cuid)   | Primary key                     |
| name        | String (unique) | e.g., "gluten", "dairy", "nuts" |
| description | String?         | Human-readable description      |
| severity    | String?         | Informational severity level    |
| createdAt   | DateTime        | Auto timestamp                  |

**Seed values:** gluten, dairy, eggs, nuts, peanuts, soy, shellfish, fish, sesame, mustard, celery, sulphites

### RecipeDietTag

Join table for recipe-to-diet-tag relationships.

| Field     | Type          | Description    |
| --------- | ------------- | -------------- |
| id        | String (cuid) | Primary key    |
| recipeId  | String (FK)   | Parent recipe  |
| dietTagId | String (FK)   | Referenced tag |
| createdAt | DateTime      | Auto timestamp |

**Constraints:**

- Unique on `(recipeId, dietTagId)`

### RecipeAllergenTag

Join table for recipe-to-allergen relationships (indicates recipe CONTAINS allergen).

| Field         | Type          | Description         |
| ------------- | ------------- | ------------------- |
| id            | String (cuid) | Primary key         |
| recipeId      | String (FK)   | Parent recipe       |
| allergenTagId | String (FK)   | Referenced allergen |
| createdAt     | DateTime      | Auto timestamp      |

**Constraints:**

- Unique on `(recipeId, allergenTagId)`

### RecipeStatusHistory

Audit trail for recipe status changes.

| Field     | Type          | Description                      |
| --------- | ------------- | -------------------------------- |
| id        | String (cuid) | Primary key                      |
| recipeId  | String (FK)   | Parent recipe                    |
| status    | RecipeStatus  | New status                       |
| changedBy | String? (FK)  | User who made change             |
| reason    | String?       | Optional rejection/change reason |
| createdAt | DateTime      | Timestamp of change              |

**Constraints:**

- Most recent entry reflects current recipe status

### RecipeImage

Metadata for recipe images (including AI-generated).

| Field     | Type           | Description                      |
| --------- | -------------- | -------------------------------- |
| id        | String (cuid)  | Primary key                      |
| recipeId  | String (FK)    | Parent recipe                    |
| url       | String         | Image URL or path                |
| prompt    | String? (text) | AI generation prompt             |
| model     | String?        | AI model used (e.g., "dall-e-3") |
| isPrimary | Boolean        | Is this the main recipe image?   |
| width     | Int?           | Image width in pixels            |
| height    | Int?           | Image height in pixels           |
| fileSize  | Int?           | Size in bytes                    |
| mimeType  | String?        | e.g., "image/webp"               |
| altText   | String?        | Accessibility alt text           |
| createdAt | DateTime       | Auto timestamp                   |
| updatedAt | DateTime       | Auto timestamp                   |

**Constraints:**

- Only one `isPrimary = true` per recipe

## Recipe Model Updates

The existing `Recipe` model will be extended with:

| Field             | Type             | Description                              |
| ----------------- | ---------------- | ---------------------------------------- |
| status            | RecipeStatus     | Current approval status (default: DRAFT) |
| difficulty        | RecipeDifficulty | Skill level (default: MEDIUM)            |
| prepTimeMinutes   | Int              | Separate from cook time                  |
| cookTimeMinutes   | Int              | Renamed from `minutes`                   |
| totalTimeMinutes  | Int?             | Computed or override                     |
| sourceUrl         | String?          | Original recipe source                   |
| sourceAttribution | String?          | Credit for adapted recipes               |
| slug              | String (unique)  | URL-friendly identifier                  |
| publishedAt       | DateTime?        | When recipe went live                    |

**Deprecated fields** (to be removed after migration):

- `isVegetarian` - Replaced by DietTag "vegetarian"
- `isDairyFree` - Replaced by absence of AllergenTag "dairy"
- `instructionsMd` - Replaced by RecipeStep table
- `imageUrl` - Replaced by RecipeImage table (isPrimary)

## Migration Strategy

### Phase 1: Add New Tables (Non-Breaking)

1. Create all new tables and enums
2. Add new fields to Recipe with defaults
3. Create indexes

### Phase 2: Data Migration

1. Parse `instructionsMd` into RecipeStep records
2. Create RecipeNutrition from existing `calories`
3. Map `isVegetarian` → RecipeDietTag
4. Map `isDairyFree` → absence of dairy AllergenTag
5. Move `imageUrl` → RecipeImage (isPrimary: true)
6. Set all existing recipes to status: APPROVED

### Phase 3: Cleanup (Breaking)

1. Remove deprecated fields after all consumers updated
2. Update seed.ts to use new structure

## Indexes

```prisma
// Performance indexes
@@index([recipeId, stepNumber])     // RecipeStep
@@index([recipeId])                 // RecipeNutrition, RecipeImage
@@index([name])                     // DietTag, AllergenTag
@@index([status])                   // Recipe
@@index([status, publishedAt])      // Recipe listing queries
@@index([recipeId, createdAt])      // RecipeStatusHistory
```

## Sample Queries

### Get recipe with all details

```typescript
const recipe = await prisma.recipe.findUnique({
  where: { slug: "chicken-stir-fry" },
  include: {
    steps: { orderBy: { stepNumber: "asc" } },
    nutrition: true,
    ingredients: { include: { ingredient: true } },
    dietTags: { include: { dietTag: true } },
    allergenTags: { include: { allergenTag: true } },
    images: { where: { isPrimary: true } },
  },
});
```

### Get vegetarian recipes without dairy

```typescript
const recipes = await prisma.recipe.findMany({
  where: {
    status: "APPROVED",
    dietTags: { some: { dietTag: { name: "vegetarian" } } },
    allergenTags: { none: { allergenTag: { name: "dairy" } } },
  },
});
```

### Get recipes pending review

```typescript
const pending = await prisma.recipe.findMany({
  where: { status: "PENDING_REVIEW" },
  include: {
    statusHistory: {
      orderBy: { createdAt: "desc" },
      take: 1,
    },
  },
});
```

## Compatibility Notes

- The migration is designed to be non-breaking initially
- Deprecated fields will coexist with new structure during transition
- Backend services should prefer new fields but fall back to deprecated
- Frontend components will be updated incrementally
- Seed data will be updated to populate new tables

## Related Issues

- #228: Add recipe domain types, repositories, and transitional seed ingest
- #229: Create canonical ingredient dictionary + schema support
- #230: Implement allergen & diet tag derivation service
- #231: Backfill diet/allergen tags for existing recipes
