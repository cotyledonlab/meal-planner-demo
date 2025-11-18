# GitHub Copilot Instructions for meal-planner-demo

> **📌 Note**: This file is maintained for GitHub Copilot compatibility. For the complete and authoritative
> development guidelines used by all AI assistants, see [`/AGENTS.md`](../AGENTS.md) at the repository root.

Last updated: 2025-11-02

## Project Overview

MealMind AI is an AI-powered meal planning demo for friends/family. The core flow covers:

- Preference intake → 7-day meal plans → recipes → shopping lists → edits → export/share
- Only build features traceable to this core loop

## Active Technologies

- **Language & Runtime**: TypeScript (Node.js 20+)
- **Framework**: Next.js App Router with React Server Components
- **API Layer**: tRPC for type-safe APIs
- **Validation**: Zod schemas
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI GPT-5 Codex SDK
- **Logging**: pino for structured logging
- **Monitoring**: Sentry (feature-gated)
- **Caching**: Redis client
- **Package Manager**: pnpm workspaces (monorepo)
- **Containerization**: Docker and Docker Compose

## Monorepo Structure

This is a **pnpm workspace monorepo**. All commands run from the root automatically delegate to workspaces:

```
meal-planner-demo/          # Monorepo root
├── apps/
│   └── web/                # Next.js web application
│       ├── src/
│       │   ├── app/        # Next.js App Router pages and layouts
│       │   ├── server/     # tRPC API routes and server-side logic
│       │   ├── components/ # React components (coming soon)
│       │   ├── lib/        # Utility functions and shared code (coming soon)
│       │   └── test/       # Test utilities and mocks
│       ├── prisma/         # Database schema and migrations
│       ├── public/         # Static assets
│       └── package.json    # Web app dependencies
├── packages/
│   ├── types/              # Shared TypeScript types
│   └── constants/          # Shared constants
├── infra/
│   ├── postgres/           # PostgreSQL configuration
│   └── migrations/         # Migration history (reference)
├── specs/                  # Feature specifications and plans
├── package.json            # Root package with workspace scripts
└── pnpm-workspace.yaml     # Workspace configuration
```

## Essential Commands

Run all commands from the **monorepo root**. They automatically delegate to the correct workspace:

```bash
# Development
pnpm dev              # Start Next.js dev server (delegates to apps/web)
pnpm build            # Build production bundle
pnpm start            # Start production server
pnpm preview          # Build and start production server

# Testing & Quality
pnpm check            # Run linting and type checking
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues automatically
pnpm typecheck        # Run TypeScript type checking
pnpm format:check     # Check code formatting (across all workspaces)
pnpm format:write     # Format code with Prettier (across all workspaces)
pnpm test             # Run all unit tests with Vitest
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Open Vitest UI for interactive testing
pnpm test:coverage    # Run tests with coverage report

# Database
pnpm db:generate      # Generate Prisma client and run migrations
pnpm db:migrate       # Run Prisma migrations in production
pnpm db:push          # Push schema changes to database
pnpm db:seed          # Seed database with sample data (users, recipes, ingredients)
pnpm db:studio        # Open Prisma Studio

# Workspace-specific commands (when needed)
pnpm --filter @meal-planner-demo/web <command>
pnpm --filter @meal-planner-demo/types <command>
```

## Code Style & Guidelines

### TypeScript

- Use strict TypeScript with no `any` types
- All API inputs must be validated with Zod schemas
- Node.js 20+ features are available

### Next.js & React

- Use Next.js App Router with React Server Components
- Implement server actions for mutations
- Use tRPC for type-safe API communication

### Database

- PostgreSQL via Prisma ORM (schema located in `apps/web/prisma/`)
- All schema changes via Prisma migrations
- Include rollback scripts for migrations
- Database can be started with Docker Compose or the `./start-database.sh` script
- Seed data includes test users (premium@example.com, basic@example.com) and sample recipes

### Quality Requirements

- ESLint and Prettier are enforced in CI
- Type checking must pass (`pnpm typecheck`)
- Test with Vitest for unit tests (colocated with source files using `.test.ts` or `.test.tsx`)
- Playwright for E2E tests (coming soon)
- No `any` types allowed in code
- **All CI checks MUST pass before PR is considered complete**
- **New logic or component behavior MUST include tests**
- All tests must pass before merging
- Pre-commit hooks run automatically via Husky and lint-staged

### Security & Performance

- Never commit secrets or API keys
- Validate all inputs with Zod
- Use structured logging with pino
- Stream long AI responses
- Enforce rate limiting on AI endpoints

## Getting Started Quickly

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
cp .env apps/web/.env
# Edit both .env files with required values

# 3. Start database services
    docker compose up -d postgres
# OR use the helper script:
./start-database.sh

# 4. Initialize database
pnpm db:push

# 5. Seed test data
pnpm db:seed

# 6. Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Docker Deployment

```bash
# Full stack (PostgreSQL, Redis, Mailpit, web app)
docker compose up --build

# Detached mode
docker compose up -d --build

# Stop all services
docker compose down
```

## Pre-Commit Workflow

Before committing, run these checks (or let Husky hooks handle them):

```bash
pnpm check           # Lint + type check
pnpm format:write    # Auto-format code
pnpm test            # Run all tests
pnpm build           # Verify build (optional)
```

All checks must pass before merging. The project uses:

- **Husky** for git hooks
- **lint-staged** for automatic formatting and linting
- Hooks are automatically set up when you run `pnpm install`

## Workflow Expectations for Copilot Agents

1. Treat `/AGENTS.md` as the authoritative guide; this document is a quick reference only.
2. Use the GitHub CLI (`gh issue list`, `gh pr status`, `gh pr create`, etc.) for all GitHub workflows. MCP servers are not guaranteed—plan to rely on the standard CLI toolchain shipped with the repo.
3. Follow the required git worktree flow before making changes:
   - `git fetch origin`
   - `gh issue list --state open --json number,title` to see active work
   - `git worktree list` to confirm the issue number is free
   - `git worktree add ../meal-planner-{issue-number} origin/main`
   - `cd ../meal-planner-{issue-number}` then `git checkout -b <topic>-{issue-number}`
4. Run all commands from the monorepo root inside your worktree so workspace scripts delegate correctly.
5. Commit, push, and open PRs from inside the worktree; do not work directly from the root repository checkout.

## Important Notes for AI Assistants

- **Always work from the monorepo root** inside your worktree so scripts delegate automatically.
- **Tests are colocated** with source files (e.g., `post.ts` has `post.test.ts`).
- **Environment validation** can be skipped in CI with `SKIP_ENV_VALIDATION=1` when necessary.
- **Never commit secrets**—use environment variables.
- **Database schema** lives in `apps/web/prisma/schema.prisma`.
- **Follow the existing code style** enforced by ESLint and Prettier.

## Recent Changes

- Migrated to monorepo structure with pnpm workspaces
- Added comprehensive test suite with Vitest
- Configured pre-commit hooks with Husky and lint-staged
- Added Docker Compose for full stack deployment
- 002-project-mealmind-ai: Added TypeScript (Node.js 20+) + Next.js App Router, React Server Components, tRPC, Zod, Prisma, NextAuth, OpenAI GPT-5 Codex SDK, pino, Sentry (gated), Redis client

---

**For complete guidelines and additional details, see [`/AGENTS.md`](../AGENTS.md)**

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
