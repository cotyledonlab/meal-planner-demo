# Repository Reference

This document centralizes the current state of the monorepo so other docs (README, AGENTS, and guides under `docs/`) can stay lean and consistent.

## Stack & Conventions

- Next.js 15 (App Router) with React Server Components where practical
- TypeScript-first with strict settings; avoid `any`
- tRPC v11 + React Query 5 for client/server contracts
- Prisma 6 with PostgreSQL; seed users include `admin@example.com`, `premium@example.com`, and `basic@example.com` (password: `P@ssw0rd!`)
- Tailwind CSS 4 for styling, Prettier + ESLint for formatting and linting

## Monorepo Layout

- `apps/web/`: Next.js application (app router, server actions, tRPC routers, Prisma client)
- `packages/types`: Shared TypeScript types
- `packages/constants`: Shared constants
- `infra/`: PostgreSQL setup (`postgres/` scripts and `migrations/` reference)
- `docs/`: Feature and operations guides (auth, database config, meal planning notes)

## Environment & Data

1. Copy environment files: `cp .env.example .env && cp .env apps/web/.env` and fill required secrets (e.g., `AUTH_SECRET`). Set `GEMINI_API_KEY` if you want to use the admin-only Gemini image pipeline; otherwise that UI stays disabled.
2. Start a database:
   - Postgres only: `docker compose up -d postgres` or `./start-database.sh`
   - Full local stack (web + Postgres + Mailpit): `pnpm docker:dev` / tear down with `pnpm docker:dev:down`
3. Apply schema: `pnpm db:push`
4. Seed demo data: `pnpm db:seed` (creates admin/premium/basic users plus recipes; password `P@ssw0rd!`)
5. Run the app: `pnpm dev` (http://localhost:3000)

## Common Commands (run from repo root)

- Development: `pnpm dev` | Production build: `pnpm build` then `pnpm start`
- Formatting: `pnpm format:check` / `pnpm format:write`
- Linting: `pnpm lint` / `pnpm lint:fix`
- Types: `pnpm typecheck` | Combined lint + type: `pnpm check`
- Tests: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`, `pnpm test:ui`
- Database: `pnpm db:push`, `pnpm db:migrate`, `pnpm db:generate`, `pnpm db:seed`, `pnpm db:studio`

## Documentation Map

- Setup & Quick Start: See `README.md` (links back here for details)
- Testing workflows: `TESTING.md`
- Deployment notes: `DEPLOYMENT.md` and `SEEDING_DEPLOYMENT.md`
- Auth flows and dashboard UX: `docs/AUTH.md`, `docs/AUTH_DASHBOARD_UI_PLAN.md`
- Database configuration and fixes: `docs/DATABASE_CONFIGURATION.md`, `docs/DATABASE_FIXES_SUMMARY.md`
- Meal planning feature notes: `docs/MEAL_PLANNING_FEATURE.md`

## Admin Tools

- Gemini image pipeline: `/dashboard/admin/images` (requires admin role). Supports two model options: "Nano Banana Pro" (`gemini-3-pro-image-preview`) and "Nano Banana" (`gemini-2.5-flash-image`). Configure via `GEMINI_API_KEY` env variable. Generated files are written to `apps/web/public/generated-images/` for now; swap in blob/object storage later.

## Agent & Contributor Notes

- Keep docs DRY: update this reference first when commands, environments, or stack versions change, then link to it from other docs.
- Prefer workspace scripts in `package.json` instead of ad-hoc commands.
- Database seeding is the canonical way to create demo accounts; avoid editing seed data outside `apps/web/prisma/seed.ts` unless necessary.
