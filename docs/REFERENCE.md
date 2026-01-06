# Repository Reference

This document centralizes the current state of the monorepo so other docs (README, AGENTS, and guides under `docs/`) can stay lean and consistent.

## Stack & Conventions

- Next.js 15 (App Router) with React Server Components where practical
- TypeScript-first with strict settings; avoid `any`
- tRPC v11 + React Query 5 for client/server contracts
- Prisma 6 with PostgreSQL; seed users include admin/premium/basic demo accounts (password set via `SEED_USER_PASSWORD`)
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
4. Seed demo data: `pnpm db:seed` (creates admin/premium/basic users plus recipes; set `SEED_USER_PASSWORD` beforehand, required in production)
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

- Gemini image pipeline: `/dashboard/admin/images` (requires admin role). Supports two model options: "Nano Banana Pro" (`gemini-3-pro-image-preview`) and "Nano Banana" (`gemini-2.5-flash-image`). Configure via `GEMINI_API_KEY` env variable. Generated files are written to `apps/web/public/generated-images/` by default; configure object storage to persist images in production.
- Admin image guardrails: defaults to 100 images/day and 20 images/minute. Override with `ADMIN_IMAGE_DAILY_LIMIT` and `ADMIN_IMAGE_RATE_LIMIT_PER_MINUTE`. Set `ADMIN_IMAGE_MAINTENANCE_MODE=true` to disable generation. Set `REDIS_URL` to enable rate limiting and quota tracking.
- Recipe builder: `/dashboard/admin/recipes` (requires admin role). Uses Gemini text generation when `GEMINI_API_KEY` (or Vertex AI) is configured; model can be overridden with `GEMINI_TEXT_MODEL`.

## Object Storage (Images)

The image pipeline already supports S3-compatible storage via `apps/web/src/server/services/storage/`.

Required env vars:

- `STORAGE_PROVIDER=s3`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_REGION`

Optional env vars:

- `S3_ENDPOINT` (required for non-AWS providers like R2, DO Spaces, B2, Hetzner Object Storage)
- `S3_FORCE_PATH_STYLE=true` (only if your provider requires path-style URLs)
- `S3_PUBLIC_URL_PREFIX` (CDN/custom domain prefix for public URLs)

### Recommended Provider

- Hetzner Object Storage (S3-compatible). For Irish users, use an EU West region and set `S3_ENDPOINT` to the Hetzner S3 endpoint shown in your project (example format: `https://<region-endpoint>`). Set `S3_PUBLIC_URL_PREFIX` if you want a custom domain or CDN in front.

Example (Hetzner EU West / HEL1):

```bash
STORAGE_PROVIDER=s3
S3_BUCKET=recipe-store
S3_REGION=hel1
S3_ENDPOINT=https://hel1.your-objectstorage.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

## Agent & Contributor Notes

- Keep docs DRY: update this reference first when commands, environments, or stack versions change, then link to it from other docs.
- Prefer workspace scripts in `package.json` instead of ad-hoc commands.
- Database seeding is the canonical way to create demo accounts; avoid editing seed data outside `apps/web/prisma/seed.ts` unless necessary.
