# Tasks: Weekly Plan Generator v1

**Input**: Design documents from `/specs/002-project-mealmind-ai/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Contract, unit, and Playwright smoke tests are mandated by the specification. Test tasks are included and precede implementation work for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each slice.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare local tooling, environment, and workspace prerequisites.

- [ ] T001 [P] Initialize environment variables per quickstart in `apps/web/.env.local` and ensure secrets placeholder values documented.
- [ ] T002 [P] Verify Docker Compose stack (`postgres`, `redis`, `mailpit`) with `docker compose up` using repo root compose file and document any adjustments in `quickstart.md`.
- [ ] T003 [P] Run `pnpm install` and bootstrap Turborepo caches; update `package.json` scripts if missing `lint`, `typecheck`, `playwright test`.
- [ ] T004 Establish baseline `pnpm lint`, `pnpm typecheck`, and `pnpm test` workflows in CI notes at `specs/002-project-mealmind-ai/quickstart.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST exist before any user story work begins.

- [ ] T005 Define Prisma schema skeleton for Household, Plan, PlanDay, Meal, Recipe, ShoppingItem, UserSession entities in `packages/db/prisma/schema.prisma`.
- [ ] T006 Generate initial Prisma migration + rollback script in `packages/db/migrations/` covering entities and relationships; ensure `packages/db/ROLLBACK.md` documents rollback steps.
- [ ] T007 Configure NextAuth passwordless providers and session handling in `apps/web/app/api/auth/[...nextauth]/route.ts`.
- [ ] T008 Set up shared Zod validators and tRPC base router scaffolding in `packages/api/src/router/_app.ts`.
- [ ] T009 Add logging and observability scaffolding (pino logger, request ID middleware) in `packages/shared/src/logger.ts` and `apps/web/app/api/middleware.ts`.
- [ ] T010 Add Redis client factory with 24h cache helper in `packages/shared/src/cache/redis.ts` and document topology in `docs/redis-topology.md`.

**Checkpoint**: Foundation ready – all user stories can now proceed.

---

## Phase 3: User Story 1 – Generate a Weekly Plan (Priority: P1) 🎯 MVP

**Goal**: Household onboarding through `/onboarding`, plan configuration at `/plan/new`, AI-backed generation that persists the active plan with recipes and a categorized shopping list.

**Independent Test**: From a clean invitee or guest session, complete onboarding, submit plan parameters, observe streaming status, and land on a persistent plan view with recipes and shopping list.

### Tests for User Story 1 (write first)

- [ ] T011 [P] [US1] Author contract test validating plan + recipe schema responses in `tests/contract/plan-generation.contract.test.ts`.
- [ ] T012 [P] [US1] Implement Vitest unit tests for ingredient normalization and aggregation in `packages/shared/src/ingredients/__tests__/normalizer.test.ts`.
- [ ] T013 [P] [US1] Create Playwright smoke path for onboarding → generate plan → verify plan grid in `tests/e2e/generated-plan.spec.ts`.

### Implementation for User Story 1

- [ ] T014 [P] [US1] Build onboarding wizard UI with Zod validation in `apps/web/app/onboarding/(steps)/` and write form hooks in `apps/web/features/onboarding/useOnboardingForm.ts`.
- [ ] T015 [P] [US1] Implement plan configuration page at `/plan/new` with guardrails for day/meal caps in `apps/web/app/plan/new/page.tsx`.
- [ ] T016 [US1] Connect onboarding + plan forms to persistence via tRPC mutations in `packages/api/src/router/households.ts` and `packages/api/src/router/plans.ts`.
- [ ] T017 [P] [US1] Create AI prompt templates and tool schemas for plan + recipe generation in `packages/ai/src/prompts/plan.ts` and `packages/ai/src/prompts/recipe.ts`.
- [ ] T018 [US1] Implement `generatePlan` server action orchestrating GPT-5 calls, validation, and persistence in `apps/web/app/plan/actions/generatePlan.ts`.
- [ ] T019 [US1] Build shopping list aggregation + normalization module in `packages/shared/src/ingredients/aggregateShoppingList.ts` and integrate into plan pipeline.
- [ ] T020 [US1] Implement plan status streaming endpoint (SSE) in `apps/web/app/api/plans/[planId]/events/route.ts`.
- [ ] T021 [US1] Render initial plan grid view with recipes summary and shopping list in `apps/web/app/plan/[planId]/page.tsx`.
- [ ] T022 [US1] Enforce 21-meal cap, token/cost ceilings, and cache reuse logic within `packages/api/src/router/plans.ts`.
- [ ] T023 [US1] Add nutrition disclaimer banners to plan and list views in `apps/web/components/PlanDisclaimer.tsx`.
- [ ] T024 [US1] Wire Redis cache reuse for identical plan requests in `packages/shared/src/cache/planCache.ts`.

**Checkpoint**: User Story 1 functional end-to-end and independently testable.

---

## Phase 4: User Story 2 – Review and Adjust Meals (Priority: P2)

**Goal**: Enable plan inspection, inline recipe previews, and swap/regenerate operations while preserving constraints and refreshing dependent data.

**Independent Test**: From an existing plan, open any meal preview, trigger swap/regenerate, confirm replacements honor constraints and shopping list updates immediately.

### Tests for User Story 2 (write first)

- [ ] T025 [P] [US2] Extend contract test coverage for swap/regenerate endpoints in `tests/contract/plan-mutations.contract.test.ts`.
- [ ] T026 [P] [US2] Add Playwright scenario for previewing a recipe, swapping a meal, and validating shopping list changes in `tests/e2e/adjust-plan.spec.ts`.

### Implementation for User Story 2

- [ ] T027 [P] [US2] Build recipe preview drawer component in `apps/web/components/RecipePreviewDrawer.tsx`.
- [ ] T028 [US2] Implement `POST /api/plans/{planId}/swap` handler with constraint validation in `apps/web/app/api/plans/[planId]/swap/route.ts`.
- [ ] T029 [US2] Implement `POST /api/plans/{planId}/regenerate-day` handler in `apps/web/app/api/plans/[planId]/regenerate-day/route.ts`.
- [ ] T030 [US2] Update plan UI to trigger swap/day regeneration and show optimistic loading states in `apps/web/app/plan/[planId]/page.tsx`.
- [ ] T031 [US2] Ensure shopping list recalculates after meal/day alterations using `aggregateShoppingList` in `packages/shared/src/ingredients/aggregateShoppingList.ts`.
- [ ] T032 [US2] Persist plan supersede behavior (active → superseded) when regenerating in `packages/db/src/repositories/plansRepository.ts`.

**Checkpoint**: User Story 1 + 2 both independently testable.

---

## Phase 5: User Story 3 – Export and Share Outcomes (Priority: P3)

**Goal**: Provide downloadable PDF summary and CSV shopping list exports that mirror on-screen content and include mandatory disclaimers.

**Independent Test**: From a completed plan, download PDF and CSV, open them locally, confirm layout, list aggregation, and disclaimer text match current plan state.

### Tests for User Story 3 (write first)

- [ ] T033 [P] [US3] Add automated check ensuring exports include disclaimers in `tests/contract/exports.contract.test.ts`.
- [ ] T034 [P] [US3] Extend Playwright smoke to verify download + basic file assertions in `tests/e2e/export-plan.spec.ts`.

### Implementation for User Story 3

- [ ] T035 [P] [US3] Implement PDF generator pipeline (plan summary + condensed recipes) in `packages/shared/src/export/pdfPlanExporter.ts`.
- [ ] T036 [P] [US3] Implement CSV export for shopping list grouped by category in `packages/shared/src/export/shoppingListCsv.ts`.
- [ ] T037 [US3] Add export routes `GET /api/plans/{planId}/exports/pdf|csv` in `apps/web/app/api/plans/[planId]/exports/{pdf,csv}/route.ts`.
- [ ] T038 [US3] Surface export buttons and download handlers in `apps/web/app/plan/[planId]/page.tsx`.
- [ ] T039 [US3] Add server-side guards to ensure exports respect active-session permissions in `packages/api/src/router/exports.ts`.

**Checkpoint**: All three user stories independently testable and demonstrable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize observability, documentation, and operational readiness.

- [ ] T040 [P] Document AI prompt library and golden prompts in `packages/ai/README.md`.
- [ ] T041 Add rate-limit monitoring hooks and log redaction for prompts in `packages/shared/src/middleware/rateLimit.ts`.
- [ ] T042 [P] Wire Sentry (env-gated) and ensure request IDs flow through exports and plan generation in `apps/web/lib/observability.ts`.
- [ ] T043 Update `quickstart.md` with latest commands, sample data instructions, and troubleshooting notes.
- [ ] T044 Run full quickstart validation, recording results in `specs/002-project-mealmind-ai/quickstart.md` checklist section.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)** → prerequisite for Foundational.
- **Foundational (Phase 2)** → blocks all user stories.
- **User Story Phases (3–5)** → proceed in priority order (P1 → P2 → P3) once Foundational complete; parallel execution allowed across stories after P1 if resources permit.
- **Polish (Phase 6)** → final phase after desired user stories.

### User Story Dependencies
- **US1**: Depends on Phase 2 completion; no other story dependencies.
- **US2**: Depends on US1 assets (plan view, aggregation) to exist.
- **US3**: Depends on US1 data persistence and US2 adjustments for up-to-date plan state.

---

## Parallel Execution Examples

### User Story 1
- Parallelizable before orchestration wiring: T014, T015, T017 can run concurrently.
- Test tasks T011–T013 can execute in parallel test suites.

### User Story 2
- T027 (UI) and T028 (swap handler) can run concurrently; coordinate with T030 for UI wiring.

### User Story 3
- T035 (PDF exporter) and T036 (CSV exporter) parallelizable prior to route integration.

---

## Implementation Strategy

### MVP First (US1)
1. Complete Phases 1–2.
2. Deliver US1 (Phase 3) and run T011–T024.
3. Demonstrate onboarding-to-plan flow as MVP before proceeding.

### Incremental Delivery
1. Deploy after US1 (core generation).
2. Layer US2 features (adjustments) and redeploy.
3. Add US3 exports and finalize.

### Validation Rhythm
- Ensure each phase passes lint/typecheck/tests before moving on.
- Maintain Playwright smoke to guard regression of critical loop.
- Use Redis cache instrumentation to confirm cost control before launch.
