# meal-planner-demo Development Guidelines

_Last updated: 2025-11-02_

These instructions apply to the entire repository. Keep documentation DRY by leaning on `docs/REFERENCE.md` for canonical commands and stack notes.

## Project Snapshot

- Next.js 15 (App Router) with React Server Components where practical
- Strict TypeScript; avoid `any`
- tRPC v11 + React Query 5
- Prisma 6 on PostgreSQL; seed users `admin@example.com` / `premium@example.com` / `basic@example.com` with password `P@ssw0rd!`
- Tailwind CSS 4, Prettier + ESLint formatting and linting
- Monorepo managed by pnpm workspaces (root scripts delegate to `apps/web`)

## Workflow Expectations

- Prefer workspace scripts in `package.json` over ad-hoc commands. Canonical lists live in [`docs/REFERENCE.md`](docs/REFERENCE.md).
- Environment setup: copy `.env.example` to `.env` and `apps/web/.env`, then run `pnpm db:push` and `pnpm db:seed` after starting Postgres (`docker compose up -d postgres`, `pnpm docker:dev`, or `./start-database.sh`).
- Tests and quality gates: use `pnpm check`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm format:write` from the repo root. See [`TESTING.md`](TESTING.md) for details.
- Deployment specifics and SMTP configuration are in [`DEPLOYMENT.md`](DEPLOYMENT.md) and [`SEEDING_DEPLOYMENT.md`](SEEDING_DEPLOYMENT.md).

## Code & Documentation Style

- Validate API inputs with Zod; keep server/client contracts type-safe via tRPC.
- Keep React components modular; prefer server components unless client interactivity is required.
- Do not wrap imports in try/catch blocks.
- Update docs when behavior or commands change. Start with [`docs/REFERENCE.md`](docs/REFERENCE.md) to avoid duplication, then add links from `README.md` or other guides as needed.

## When in Doubt

- Follow the monorepo structure outlined in `README.md` and `docs/REFERENCE.md`.
- Use seed data rather than ad-hoc database changes for demo content.
- Keep changes scoped to the core flow: preferences → 7-day meal plans → recipes → shopping lists → edits/export.
