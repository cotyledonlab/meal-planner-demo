# Recipe Builder (Admin) - Spec

## Purpose

Define how the admin recipe builder should work using AI-assisted drafting, aligned with the existing admin dashboard patterns and the normalized recipe schema.

## Scope

### MVP Scope

- Admin-only recipe builder inside the dashboard.
- AI-assisted draft generation using a structured JSON contract.
- Human review/edit before publish.
- Publish to existing recipe tables so plans can use the recipes without special handling.

### Out of Scope (MVP)

- Version history and diffing.
- Section-by-section regeneration.
- Pantry-aware substitutions or pricing.
- Nutrition estimation if missing.

## Existing System Alignment

- Admin access gate matches existing `/dashboard/admin/*` routes.
- Recipes are normalized in Prisma (`Recipe`, `RecipeIngredient`, `RecipeStep`, `RecipeNutrition`, `RecipeImage`).
- Recipe status workflow exists (`DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `ARCHIVED`).
- Images already store AI metadata (`prompt`, `model`) on `RecipeImage`.

## MVP User Flow (Admin)

1. Open `/dashboard/admin/recipes`.
2. Click "New Recipe".
3. Choose "AI-assisted".
4. Fill prompt builder fields (cuisine, diet tags, servings, time, difficulty, include/avoid ingredients).
5. Generate draft and populate structured editor fields.
6. Edit/verify fields (title, description, times, ingredients, steps, tags).
7. Generate image (reuse the existing image pipeline).
8. Save as draft or publish.

## MVP Data Contract (AI Output)

Return JSON that validates against a strict Zod schema (no extra keys). Example schema outline:

- title: string
- description: string
- servingsDefault: number
- prepTimeMinutes: number
- cookTimeMinutes: number
- totalTimeMinutes: number
- calories: number
- difficulty: enum
- mealTypes: enum[]
- ingredients: array of { name: string, quantity: number, unit: string, notes?: string }
- steps: array of { instruction: string, stepType?: enum, durationMinutes?: number, tips?: string }
- nutrition?: { calories: number, protein: number, carbohydrates: number, fat: number, fiber?, sugar?, sodium? }
- dietTags?: string[]
- allergenTags?: string[]

## MVP Admin UI

### Recipes List

- Filters: status, meal type, search by title.
- Actions: edit, publish/unpublish.

### Create/Edit Recipe

- Prompt Builder panel (AI inputs).
- Generated Draft panel (structured fields).
- Regenerate draft button.
- Generate image button.
- Save Draft and Publish actions.

### UI Wireframe Notes (MVP)

- Admin Recipes List (`/dashboard/admin/recipes`)
  - Table columns: Title, Status, Meal Types, Updated, Actions.
  - Primary CTA: "New Recipe" (opens Create/Edit screen).
  - Row actions: Edit, Publish/Unpublish.
- Create/Edit Screen (`/dashboard/admin/recipes/new` or `/dashboard/admin/recipes/[id]`)
  - Left column: Prompt Builder.
    - Inputs: cuisine, mealTypes (multi-select), difficulty, servings, total time, include list, avoid list.
    - Buttons: "Generate Draft", "Regenerate Draft".
  - Right column: Draft Editor.
    - Recipe meta: title, description, servings, times, difficulty, meal types.
    - Ingredients list editor (name, quantity, unit, notes).
    - Steps list editor (step number, instruction, step type, duration, tips).
    - Tag pickers (diet tags, allergen tags).
  - Footer actions: "Save Draft", "Publish".
  - Image panel: "Generate Image" button, shows primary image preview.

## MVP tRPC Endpoints

- admin.recipe.generateDraft(input: PromptParams) -> RecipeDraft
- admin.recipe.saveDraft(input: RecipeDraft) -> Recipe
- admin.recipe.publish(input: { id }) -> Recipe
- admin.recipe.list(input: filters) -> Recipe[]
- admin.recipe.update(input: Recipe) -> Recipe

## MVP API Contracts (MVP)

### PromptParams

- cuisine: string | null
- mealTypes: MealType[]
- difficulty: RecipeDifficulty
- servingsDefault: number
- totalTimeMinutes: number
- includeIngredients: string[]
- avoidIngredients: string[]
- dietTags: string[]
- allergenTags: string[]

### RecipeDraft

- title: string
- description: string
- servingsDefault: number
- prepTimeMinutes: number
- cookTimeMinutes: number
- totalTimeMinutes: number
- difficulty: RecipeDifficulty
- mealTypes: MealType[]
- ingredients: Array<{ name: string; quantity: number; unit: string; notes?: string }>
- steps: Array<{ instruction: string; stepType?: StepType; durationMinutes?: number; tips?: string }>
- nutrition?: { calories: number; protein: number; carbohydrates: number; fat: number; fiber?: number; sugar?: number; sodium?: number }
- dietTags?: string[]
- allergenTags?: string[]
- sourcePrompt?: string

### Save Draft Notes

- Server resolves ingredient names to `Ingredient` records or creates missing ones (admin-only).
- Steps are saved to `RecipeStep` with incrementing `stepNumber` starting at 1.
- Recipe status stays `DRAFT`.

### Publish Notes

- Sets `status=APPROVED`, `publishedAt=now`.
- Creates a `RecipeStatusHistory` entry.

## MVP Prompt Template

System:

- "You are a professional recipe developer. Return JSON only."

User:

- "Create a recipe with: cuisine={cuisine}, diet={diet}, servings={servings}, totalTime={time}, difficulty={difficulty}, mustInclude=[...], avoid=[...]. Output in the JSON schema."

## Zod Schema Sketch (MVP)

```ts
import { z } from "zod";

const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner"]);
const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);
const stepTypeSchema = z.enum(["PREP", "COOK", "REST", "ASSEMBLE"]);

export const recipeDraftSchema = z
  .object({
    title: z.string().min(4).max(120),
    description: z.string().min(10).max(280),
    servingsDefault: z.number().int().min(1).max(12),
    prepTimeMinutes: z.number().int().min(0).max(240),
    cookTimeMinutes: z.number().int().min(0).max(360),
    totalTimeMinutes: z.number().int().min(5).max(480),
    difficulty: difficultySchema,
    mealTypes: z.array(mealTypeSchema).min(1),
    ingredients: z
      .array(
        z.object({
          name: z.string().min(2).max(80),
          quantity: z.number().positive().max(5000),
          unit: z.string().min(1).max(20),
          notes: z.string().max(120).optional(),
        }),
      )
      .min(5),
    steps: z
      .array(
        z.object({
          instruction: z.string().min(6).max(600),
          stepType: stepTypeSchema.optional(),
          durationMinutes: z.number().int().min(0).max(240).optional(),
          tips: z.string().max(280).optional(),
        }),
      )
      .min(3),
    nutrition: z
      .object({
        calories: z.number().int().min(50).max(2000),
        protein: z.number().min(0).max(150),
        carbohydrates: z.number().min(0).max(300),
        fat: z.number().min(0).max(150),
        fiber: z.number().min(0).max(80).optional(),
        sugar: z.number().min(0).max(150).optional(),
        sodium: z.number().min(0).max(4000).optional(),
      })
      .optional(),
    dietTags: z.array(z.string().min(2).max(30)).optional(),
    allergenTags: z.array(z.string().min(2).max(30)).optional(),
    sourcePrompt: z.string().min(10).max(1000).optional(),
  })
  .strict();
```

## MVP API Error States

- `generateDraft`
  - Invalid prompt params: return `BAD_REQUEST` with Zod error details.
  - AI response not valid JSON: return `INTERNAL_SERVER_ERROR` with safe message and allow regenerate.
  - AI output fails schema validation: return `UNPROCESSABLE_CONTENT` with field errors.
- `saveDraft`
  - Ingredient resolution failed: return `CONFLICT` with list of unresolved names.
  - Missing required fields: return `BAD_REQUEST` with Zod error details.
  - DB write failure: return `INTERNAL_SERVER_ERROR` and log context.
- `publish`
  - Recipe not found or not draft: return `NOT_FOUND` or `CONFLICT`.
  - Fails validation gates (steps/ingredients/servings): return `PRECONDITION_FAILED`.
  - Status history create fails: return `INTERNAL_SERVER_ERROR` and log context.

## Recipe Image Storage Strategy (MVP)

- Default to local storage in dev (current behavior).
- Use the existing S3-compatible provider in production.
- Store the public image URL on `RecipeImage.url` and keep AI metadata in `prompt` and `model`.

### Storage Configuration Checklist

- Set `STORAGE_PROVIDER=s3` in production.
- Provide `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_REGION`.
- Set `S3_ENDPOINT` for non-AWS providers (Cloudflare R2, DigitalOcean Spaces, Backblaze B2, Hetzner Object Storage).
- Use `S3_FORCE_PATH_STYLE=true` only if the provider requires it.
- Set `S3_PUBLIC_URL_PREFIX` if serving through a CDN or custom domain.
- Ensure containers have outbound access to the object store endpoint.

## MVP Validation Checklist (Definition of Done)

- Admin access gate: route under `/dashboard/admin/*` and enforces `user.role === 'admin'`.
- Recipe status: new recipes start as `DRAFT`; publish sets `APPROVED` and `publishedAt`.
- Recipe steps: AI output saved into `RecipeStep` with `stepNumber` ordering (no reliance on `instructionsMd`).
- Ingredient mapping: each AI ingredient resolves to a real `Ingredient` record and creates `RecipeIngredient` rows (no free-text-only ingredients).
- Tags stored via `RecipeDietTag` / `RecipeAllergenTag` (no use of legacy `isVegetarian` / `isDairyFree`).
- Recipe image: if generated, saved to `RecipeImage` with `prompt`, `model`, and `isPrimary=true`.
- Zod validation: AI draft JSON validates server-side before saving.
- UI validation: block publish if required fields are missing (title, steps >= 3, ingredients >= 5, servings > 0).
- Audit trail: publishing creates a `RecipeStatusHistory` entry.
- Seed compatibility: published recipes appear in normal queries (plan generation uses `RecipeRepository`).
- Existing admin image workflow remains unchanged.

## MVP Task Breakdown (Suggested Iteration Order)

1. Admin routes and navigation
   - Add `/dashboard/admin/recipes` index route with admin guard.
   - Add placeholder list UI and "New Recipe" CTA.
2. AI draft generation API
   - Add `admin.recipe.generateDraft` tRPC endpoint.
   - Implement Zod validation using `recipeDraftSchema`.
3. Draft editor UI
   - Build Create/Edit screen and bind to draft fields.
   - Add client-side validation aligned with Zod.
4. Save draft + ingredient resolution
   - Add `admin.recipe.saveDraft` tRPC endpoint.
   - Resolve ingredients and create `RecipeIngredient` rows.
5. Publish workflow
   - Add `admin.recipe.publish` endpoint.
   - Create `RecipeStatusHistory` and set `publishedAt`.
6. Image attach (optional in MVP)
   - Reuse existing admin image pipeline output.
   - Save `RecipeImage` with `isPrimary=true`.

## Ingredient Resolution Strategy (MVP)

- Default: exact case-insensitive match on `Ingredient.name`.
- Secondary: match against `CanonicalIngredient` name or aliases if present.
- Fallback: create a new `Ingredient` (admin-only) with category inferred from canonical ingredient when matched, or default category if unknown.
- UI support: show a warning list for any newly created ingredients so admins can adjust category later.

## Prompt Builder State Ownership

- Client-driven state for fast iteration and form UX (same pattern as admin image generator client).
- Server receives only validated prompt params and returns a structured draft.
- If needed later, store prompt params server-side for audit and re-generation.

## Phase 2 (Post-MVP)

- Regenerate individual sections (ingredients only / steps only / description only).
- Version history with diff view (AI draft vs. final edits).
- Nutrition estimation when missing.
- Allergen auto-tagging using canonical ingredient metadata.
- Seed export tooling for approved recipes.
- Role-based publish permissions and audit notes.
