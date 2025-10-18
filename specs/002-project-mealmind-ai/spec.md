# Feature Specification: Weekly Plan Generator v1

**Feature Branch**: `002-project-mealmind-ai`  
**Created**: 2025-10-09  
**Status**: Draft  
**Input**: User description: "PROJECT: MealMind — AI-assisted weekly meal planner. GOAL (Feature 1): “Weekly Plan Generator v1” Deliver a minimal, end-to-end flow that: 1) Collects a household profile and preferences. 2) Generates a 7-day meal plan (days/meals configurable) using AI with hard constraints. 3) Creates recipes (titles + ingredients + steps + nutrition estimate) for each planned meal. 4) Aggregates a de-duplicated shopping list grouped by aisle/category. 5) Persists plan, recipes, and list to Postgres and renders a printable/shareable view (PDF + CSV). USERS - Authenticated invitees (email magic link) and optional guest sessions. - Household fields: name, headcount, adults/kids, allergies, dislikes, cuisine likes, budget band, cooking time per meal, equipment (oven, Instant Pot, air fryer), diet tags (omnivore, vegetarian, halal, etc.), macro emphasis (high protein, high fiber, low fat). REQUIREMENTS - Page: `/onboarding` wizard for household + preferences with Zod validation. - Page: `/plan/new` form: start date, number of days (3–7), meals per day (1–3), budget band, calorie target range per adult. - Server action: `generatePlan()` orchestrates: a) Deterministic prompt with tool schema → model returns normalized structure: - days: array of { date, meals: [{ slot: breakfast|lunch|dinner, recipe_stub }] } b) For each recipe_stub, call `generateRecipe()` to expand to ingredients (metric), steps, estimated macros (rough), allergens, time, equipment. c) Build `shoppingList` by merging ingredients, normalizing units, grouping by category. - Data model (Prisma): - Household(id, userId, prefs JSON, createdAt) - Plan(id, householdId, startDate, days, mealsPerDay, budgetBand, totals JSON) - Recipe(id, planId, title, ingredients JSON, steps JSON, nutrition JSON, tags[]) - ShoppingItem(id, planId, name, qty, unit, category) - UI: - Plan grid view (day × meal), inline recipe preview drawer. - “Swap meal” button regenerates a single meal respecting constraints. - “Regenerate day” button. - Export buttons: PDF (plan + recipes condensed) and CSV (shopping list). - Constraints enforced BEFORE model call (guards) and AFTER (validator): - No listed allergens; exclude dislikes. - Time per meal <= preference limit. - Budget band heuristic: cheap proteins, seasonal veg, fewer specialty items. - Nutrition safety disclaimer on every generated view. - Caching: - Hash (household prefs + request params) → Redis cache of plan JSON for 24h to save tokens. - Cost & rate limits: - Max meals generated per action = days \* mealsPerDay; cap 21. - Token and cost ceiling per user/day with graceful errors. - Tests: - Unit tests for merging/normalizing ingredients. - Contract tests for AI response schema validation (Zod). - Playwright smoke: onboarding → generate → export. - Deployment targets: - Hetzner: Docker Compose (web, db, optional redis, caddy). Provide compose.yml. - AWS: App Runner one-container deploy; DB via RDS/Neon; secrets in SSM. ACCEPTANCE CRITERIA - A user can complete onboarding, generate a plan, view recipes, download PDF and CSV, and swap a meal—without reading docs. - All generated recipes respect allergens/dislikes and time limits. - P95 end-to-end generation completes in ≤ 20s with streaming status UI. - No untyped API surface; all inputs validated with Zod; CI green."

## Clarifications

### Session 2025-10-09

- Q: When a household generates a new plan after already having one saved, what should happen to earlier plans? -> A: Replace previous plan.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Generate a Weekly Plan (Priority: P1)

An invited or guest household representative completes the onboarding wizard, requests a weekly plan within their constraints, and receives a full plan, recipes, and shopping list in one end-to-end flow.

**Why this priority**: This is the core promise of MealMind—turning household preferences into an actionable plan.

**Independent Test**: Exercise the onboarding and plan generation flow from a clean account or guest session and confirm a saved plan, recipes, and shopping list are produced without manual intervention.

**Acceptance Scenarios**:

1. **Given** a new invited user with a valid magic-link session, **When** they enter all required household details and submit plan parameters within allowed ranges, **Then** the system confirms preferences, streams plan progress, and lands them on a populated plan view with recipes and shopping list stored for later.
2. **Given** a guest user, **When** they generate a plan with existing preferences, **Then** the system delivers the full plan experience while clearly indicating any limits (e.g., session persistence) without requiring registration.

---

### User Story 2 - Review and Adjust Meals (Priority: P2)

The household representative inspects the generated plan, opens recipe previews, and swaps or regenerates meals while keeping their constraints intact.

**Why this priority**: Adjustments build trust in AI suggestions and keep the plan aligned with real-life needs.

**Independent Test**: Starting from an existing plan, trigger meal and day regeneration and verify resulting meals respect preferences and update the plan and shopping list accordingly.

**Acceptance Scenarios**:

1. **Given** a generated plan, **When** the user opens any meal preview, **Then** they see recipe details (ingredients, steps, timing, nutrition, equipment) without leaving the plan grid.
2. **Given** a plan that includes an undesirable meal, **When** the user selects “Swap meal” or “Regenerate day”, **Then** the replacement maintains allergens, dislikes, budget, and time limits and refreshes the shopping list.

---

### User Story 3 - Export and Share Outcomes (Priority: P3)

The household representative exports the plan and shopping list for offline use or sharing.

**Why this priority**: Exportable artifacts make the plan actionable in kitchens and grocery stores.

**Independent Test**: From an existing plan, download the PDF and CSV files, confirm they open successfully, include disclaimers, and reflect the latest plan contents.

**Acceptance Scenarios**:

1. **Given** a completed plan, **When** the user downloads the PDF export, **Then** the document contains the 7-day plan summary, condensed recipes, and visible nutrition disclaimer.
2. **Given** a completed plan, **When** the user downloads the shopping list CSV, **Then** items are grouped by aisle/category with aggregated quantities that match the on-screen list.

---

### Edge Cases

- What happens when plan generation would exceed the maximum 21 meals? The system blocks the request before invoking the AI, explains the cap, and prompts the user to reduce days or meals per day.
- How does the system handle conflicting preferences (e.g., allergy and cuisine preference collision)? The system surfaces a warning during onboarding or plan setup, suggests resolving the conflict, and prevents plan submission until resolved.
- How does the system handle AI generation failures or invalid outputs? The system retries when feasible, logs the issue without sensitive data, and informs the user with actionable next steps if retries fail.
- What happens if the user’s daily token or budget allowance is exceeded? The system halts further generations that day, communicates the remaining wait time or upgrade path, and preserves existing plans.
- How are guest sessions treated when the browser is closed? The plan remains accessible only for the active session, and the user is prompted to sign in or save before leaving if they want long-term access.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The product must let invited and guest users capture household profiles covering name, headcount, adult/child counts, allergies, dislikes, preferred cuisines, budget band, cooking time limits, available equipment, diet tags, and macro emphasis.
- **FR-002**: The onboarding wizard must validate required information, highlight issues inline, and prevent progression until critical fields are completed.
- **FR-003**: Users must be able to configure plan parameters (start date, 3–7 days, 1–3 meals per day, budget band, calorie target per adult) and receive clear feedback if selections fall outside allowed limits or caps.
- **FR-004**: The system must block plan requests that would exceed 21 meals or violate stated constraints and explain the adjustment needed before continuing.
- **FR-005**: Before triggering plan generation, the system must evaluate captured preferences to ensure no allergens, dislikes, or time limits will be breached and must alert the user if conflicts exist.
- **FR-006**: Plan generation must produce a structured weekly plan where each meal includes a recipe stub that aligns with household constraints and budget heuristics.
- **FR-007**: Each recipe stub must be expanded into a complete recipe containing a title, ingredient list with metric quantities, preparation steps, estimated nutrition summary, allergen callouts, prep/cook time, and required equipment.
- **FR-008**: The system must consolidate all recipe ingredients into a de-duplicated shopping list grouped by aisle or category, including total quantities and units.
- **FR-009**: Generated plans, recipes, and shopping lists must be stored as the household's active plan so that authenticated users can revisit and regenerate later; creating a new plan replaces the previous active plan, while guest users retain access only for the duration of their session.
- **FR-010**: The plan interface must present a day-by-meal grid with inline recipe previews that open without navigating away from the plan.
- **FR-011**: Users must be able to swap an individual meal or regenerate an entire day, with replacements automatically respecting original constraints and updating associated recipes and shopping list entries.
- **FR-012**: The system must provide downloadable plan summaries in PDF format and shopping lists in CSV format, each reflecting the latest plan data and including a visible nutrition safety disclaimer.
- **FR-013**: Every plan, recipe, shopping list view, and export must display a nutrition disclaimer stating that information is informational and not medical advice.
- **FR-014**: The experience must enforce per-user daily and per-request usage limits (including token and cost ceilings) and deliver user-friendly messages when limits are reached.
- **FR-015**: When a household submits identical preferences and plan parameters within 24 hours, the system must serve the previously generated plan instead of triggering a full regeneration, while communicating that cached results are being used.
- **FR-016**: Users must receive real-time status updates during plan generation (e.g., stages for plan creation, recipe expansion, and shopping list aggregation) so they understand progress within the target completion time.
- **FR-017**: Automated validation must verify that generated plans and recipes respect captured constraints before they are shown or stored, flagging and retrying or aborting if invalid.
- **FR-018**: The solution must include automated regression coverage for ingredient normalization/aggregation and for the structured response schema used in plan and recipe generation.
- **FR-019**: The onboarding-to-export journey must be covered by a smoke test that proves the happy path works end to end.

### Key Entities _(include if feature involves data)_

- **Household**: Represents the household profile, including preferences, constraints, and association with an invited user when applicable.
- **Plan**: Captures a dated weekly schedule tied to a household, including configuration (days, meals per day, budget band) and summary nutrition totals.
- **Meal**: Embedded within a plan day, identifies the meal slot (e.g., breakfast, lunch, dinner) and references an associated recipe.
- **Recipe**: Stores the detailed instructions, ingredient lists, nutrition estimates, equipment needs, and tags for a specific meal within a plan.
- **Shopping Item**: Represents aggregated ingredient entries with name, quantity, unit, and aisle/category grouping derived from all recipes in the plan.
- **User Session**: Reflects whether the experience is tied to an authenticated invitee or an ephemeral guest, influencing persistence and limits.

### Assumptions

- Household members are willing to adjust preferences when notified of conflicts during onboarding or plan creation.
- Budget bands, aisle categories, and nutrition disclaimer language are defined externally and available for this feature.
- Guest sessions persist long enough to complete a full plan cycle but do not require long-term storage once the browser session ends.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: At least 90% of first-time invitees or guests complete onboarding and generate their first weekly plan without requiring support or retries.
- **SC-002**: 100% of plans released to users pass automated validation confirming no disallowed allergens, dislikes, or time overruns across a representative regression suite.
- **SC-003**: For active households, 95% of end-to-end plan generations (from submission to ready plan) finish within 20 seconds, with visible status updates throughout the process.
- **SC-004**: 95% of exported PDFs and CSVs open successfully across standard viewers and match on-screen content in acceptance testing.
- **SC-005**: Automated monitoring shows reuse of cached plans reduces duplicate AI generations by at least 30% for repeat preference submissions within 24 hours.
