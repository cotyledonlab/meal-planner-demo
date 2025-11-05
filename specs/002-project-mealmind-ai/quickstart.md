# Quickstart — Weekly Plan Generator v1

## Prerequisites

- Node.js 20.x
- pnpm ≥ 9
- Docker Desktop (or compatible) for PostgreSQL + Redis via Compose
- OpenAI GPT-5 Codex API key with function-calling access
- SMTP credentials for magic-link email delivery (can be mocked in dev)

## Environment Setup

1. Copy `.env.example` to `.env.local` and populate:
   - `DATABASE_URL` pointing to local Postgres container.
   - `REDIS_URL` for caching (optional but required for token budget enforcement tests).
   - `OPENAI_API_KEY`, `OPENAI_ORG`.
   - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and SMTP provider secrets.
   - `SENTRY_DSN` (optional; leave blank to disable).
2. Start backing services:
   ```bash
   docker compose up -d postgres
   # Need Mailpit locally? pnpm docker:dev
   ```
3. Install dependencies and prepare the workspace:
   ```bash
   pnpm install
   pnpm turbo run lint --filter=...
   pnpm db:generate     # prisma generate
   pnpm db:migrate      # applies baseline schema
   pnpm db:seed         # optional: load sample households + prompts
   ```

## Running the App

```bash
pnpm turbo dev --filter apps/web
```

- App served at `http://localhost:3000`.
- Access Mailpit UI at `http://localhost:8025` to inspect magic-link emails.
- Use demo invite tokens or guest mode to walk through onboarding.

## Testing

```bash
pnpm turbo run test --filter packages/api
pnpm turbo run test --filter packages/shared
pnpm turbo run vitest --filter=ingredient-normalizer
pnpm turbo run lint
pnpm turbo run typecheck
pnpm playwright test --config=tests/e2e/playwright.config.ts
```

- Contract tests validate GPT-5 response schemas before merges.
- Playwright smoke covers onboarding → plan generation → exports.

## Helpful Commands

- `pnpm turbo run generate-plan --filter apps/web` — runs server action locally for manual QA with mocked OpenAI responses.
- `pnpm turbo run storybook --filter apps/web` — review onboarding components (optional).
- `pnpm openapi:lint` — lints `/specs/002-project-mealmind-ai/contracts/openapi.yaml`.
- `pnpm db:rollback` — applies latest Prisma rollback script when backing out migrations.
