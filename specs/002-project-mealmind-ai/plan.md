# Implementation Plan: Weekly Plan Generator v1

**Branch**: `002-project-mealmind-ai` | **Date**: 2025-10-09 | **Spec**: [specs/002-project-mealmind-ai/spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-project-mealmind-ai/spec.md`

## Summary

Deliver the initial MealMind experience that walks invited or guest households through onboarding, generates a constraint-aware weekly plan with AI, expands each meal into recipes, aggregates a categorized shopping list, and exposes exports plus regeneration controls. Implementation centers on a Next.js App Router app with server actions orchestrating GPT-5 Codex prompts, Prisma-backed PostgreSQL persistence, Redis-backed caching for repeat requests, and Playwright/Vitest coverage for the happy path and core logic.

## Technical Context

**Language/Version**: TypeScript (Node.js 20+)  
**Primary Dependencies**: Next.js App Router, React Server Components, tRPC, Zod, Prisma, NextAuth, OpenAI GPT-5 Codex SDK, pino, Sentry (gated), Redis client  
**Storage**: PostgreSQL (managed in prod, Docker Compose in dev) with Prisma migrations; Redis cache (optional but planned)  
**Testing**: Vitest (unit), Playwright (end-to-end smoke), Zod schema contract tests, pnpm lint/typecheck gates  
**Target Platform**: Web application deployed via Docker Compose on Hetzner and App Runner/ECS on AWS  
**Project Type**: Turborepo monorepo with Next.js frontend + shared packages  
**Performance Goals**: ≤20s p95 end-to-end plan generation with streaming status; initial HTML <150KB; TTFB <500ms p95 for plan view  
**Constraints**: Enforce 21-meal cap per generation, per-user daily token/cost ceilings, background job concurrency limits, nutrition disclaimer on every surface  
**Scale/Scope**: Invite-only demo supporting ~100 households concurrently with single active plan per household and guest session retention limited to active browser session

## Constitution Check

- **Language & Runtime**: Plan uses TypeScript and Node 20+ exclusively — compliant.
- **Package & Build**: Turborepo with pnpm maintained; no conflicting tooling introduced.
- **Web & API**: Next.js App Router with server actions and tRPC/Zod contracts covered in design.
- **Data & Infra**: PostgreSQL via Prisma with Docker Compose for local dev; deployment notes include Hetzner + AWS targets; Redis usage documented.
- **Auth & Exports**: NextAuth magic links and server-side PDF/CSV exports included.
- **Quality Gates**: Strict TS, ESLint, Prettier, Vitest, and Playwright coverage planned; performance and accessibility budgets embedded.
- **Security & Cost**: Rate limiting, token caps, secret handling, and cache reuse addressed in requirements.
- **Process**: Following `/specify → /plan → /tasks`; migrations via Prisma with rollback scripts planned.

**Post-Design Validation (2025-10-09)**: Design assets (research, data model, contracts) reinforce the same constitution-compliant stack decisions; no deviations detected.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
apps/
├── web/                  # Next.js App Router frontend + server actions
│   ├── app/
│   ├── components/
│   ├── features/plan/
│   ├── features/onboarding/
│   ├── lib/
│   └── tests/
packages/
├── api/                  # tRPC routers, shared procedures, Zod schemas
├── db/                   # Prisma schema, migrations, seeding, rollback scripts
├── ai/                   # Prompt templates, function-call definitions, guards
└── shared/               # Cross-cutting utilities (logging, config, rate limits)
tests/
├── e2e/                  # Playwright specs
└── contract/             # Contract & schema validation harness
```

**Structure Decision**: Adopt a Turborepo layout with a single Next.js app in `apps/web` and supporting shared packages for API contracts, database access, AI orchestration, and utilities to keep feature logic modular and enforce clear ownership of prompts, migrations, and cross-cutting concerns.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _None_ |  |  |
