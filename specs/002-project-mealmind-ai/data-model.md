# Data Model — Weekly Plan Generator v1

## Household

- **Purpose**: Represents an invited or guest household’s profile and preferences.
- **Key Fields**:
  - `id` (UUID) — primary key.
  - `userId` (UUID | null) — links to authenticated invitee; null for guest sessions.
  - `name` (string, 1-80 chars).
  - `headcount` (integer ≥1).
  - `adults` / `kids` (integers ≥0, adults + kids = headcount).
  - `allergies` (string[]).
  - `dislikes` (string[]).
  - `preferredCuisines` (string[]).
  - `budgetBand` (enum: economical, moderate, premium).
  - `equipment` (string[] drawn from controlled list).
  - `dietTags` (string[]; e.g., omnivore, vegetarian, halal).
  - `macroEmphasis` (enum: highProtein, highFiber, lowFat, balanced).
  - `maxCookTimeMinutes` (integer ≥10).
  - `prefsVersion` (integer) — bump when onboarding completes to invalidate caches.
  - `createdAt` / `updatedAt` (timestamps).
- **Relationships**: One-to-many with Plan (active constraint: at most one plan where `status = active`).
- **Validation rules**:
  - Allergies/dislikes must not overlap with preferred cuisines.
  - Equipment entries limited to supported devices (oven, instantPot, airFryer, stovetop, microwave).
  - Macro emphasis optional; default `balanced`.

## Plan

- **Purpose**: Stores the active generated plan for a household.
- **Key Fields**:
  - `id` (UUID) — primary key.
  - `householdId` (UUID, FK to Household).
  - `startDate` (date).
  - `days` (integer between 3 and 7).
  - `mealsPerDay` (integer between 1 and 3).
  - `budgetBand` (enum aligned with household budget).
  - `calorieTarget` (object with `min`/`max` per adult, integers).
  - `totals` (JSON) — aggregated nutrition totals (calories, protein, carbs, fat).
  - `status` (enum: active, superseded) — only one active per household.
  - `generatedAt` (timestamp).
  - `cachedHash` (string | null) — hash of prefs + parameters that produced this plan.
- **Relationships**: One-to-many with PlanDay, Recipe, ShoppingItem.
- **Validation rules**:
  - `days * mealsPerDay` ≤ 21 enforced on save.
  - `budgetBand` must match household budget or the chosen override.
  - `status` transitions: default `active`; previous active plans moved to `superseded` during regeneration.

## PlanDay

- **Purpose**: Captures per-day scheduling metadata.
- **Key Fields**:
  - `id` (UUID).
  - `planId` (UUID, FK).
  - `date` (date).
- **Relationships**: One-to-many with Meal; belongs to Plan.
- **Validation rules**:
  - Dates must form a contiguous range from plan `startDate`.

## Meal

- **Purpose**: Represents a scheduled meal slot within a day.
- **Key Fields**:
  - `id` (UUID).
  - `planDayId` (UUID, FK).
- **Attributes**:
  - `slot` (enum: breakfast, lunch, dinner).
  - `recipeId` (UUID, FK to Recipe).
  - `source` (enum: original, swapped, regenerated).
- **Validation rules**:
  - Each plan day must contain `mealsPerDay` meals.
  - Regenerated meals inherit household constraints; tracked via `source`.

## Recipe

- **Purpose**: Detailed recipe output generated from AI.
- **Key Fields**:
  - `id` (UUID).
  - `planId` (UUID, FK).
  - `title` (string ≤ 120 chars).
  - `ingredients` (JSON array of `{name, quantity, unit, aisleCategory, notes}`).
  - `steps` (ordered JSON array of instructional strings).
  - `nutrition` (JSON object with calories, protein, carbs, fat per serving).
  - `allergens` (string[]).
  - `estimatedTimeMinutes` (integer > 0).
  - `requiredEquipment` (string[] subset of household equipment vocabulary).
  - `tags` (string[] for dietary labels).
- **Relationships**: One-to-many with Meal (referenced), belongs to Plan.
- **Validation rules**:
  - `allergens` must be disjoint from household allergy list.
  - `estimatedTimeMinutes` ≤ household `maxCookTimeMinutes`.

## ShoppingItem

- **Purpose**: Aggregated shopping line items derived from recipe ingredients.
- **Key Fields**:
  - `id` (UUID).
  - `planId` (UUID, FK).
  - `name` (string ≤ 100 chars).
  - `quantity` (decimal ≥ 0).
  - `unit` (enum or string from normalized list).
  - `category` (enum: produce, pantry, dairy, protein, frozen, bakery, other).
- **Validation rules**:
  - Items for same `name+unit+category` combination must be merged prior to persistence.
  - Quantity precision capped at two decimals after normalization.

## UserSession

- **Purpose**: Tracks whether the plan belongs to an authenticated invitee or guest.
- **Key Fields**:
  - `id` (UUID).
  - `householdId` (UUID, FK).
  - `type` (enum: invitee, guest).
  - `expiresAt` (timestamp for guest sessions).
- **Validation rules**:
  - Guest sessions must set `expiresAt` within 24 hours.
  - Invitee sessions require `userId` on Household.
