# meal-planner-demo Development Guidelines

Last updated: 2025-10-26

## Current State

**Active PR**: PR #79 - "Fix: Add migration stage to Dockerfile for proper deployment"

- **Status**: OPEN, awaiting merge
- **Purpose**: Fixes deployment failures by creating dedicated `migration` Docker stage for database operations
- **All tests passing**: 102 tests, TypeScript, ESLint, Prettier, pre-push checks

**Recent Fixes**:

1. Created dedicated `migration` Docker stage for database migrations/seeding
2. Fixed `target: builder` → `target: migration` in docker-compose.yml (both migrate and seed services)
3. Added pnpm version consistency with ARG PNPM_VERSION across all Dockerfile stages
4. Fixed shopping list error handling (null instead of mock object)
5. Addressed all Copilot code review comments

**Deployment Context**:

- Application deployed via Dokploy on a VPS
- Typical workflow: Push to main → Dokploy triggers auto-deployment
- Direct access to `/etc/dokploy/` for deployment logs and configuration
- Recent deployment issue: `service "migrate" didn't complete successfully: exit 1` - **NOW FIXED**

## Project Overview

MealMind AI is an AI-powered meal planning demo for friends/family. The core flow covers:

- Preference intake → 7-day meal plans → recipes → shopping lists → edits → export/share
- Only build features traceable to this core loop

## Active Technologies

- TypeScript (Node.js 20+) + Next.js App Router, React Server Components, tRPC, Zod, Prisma, NextAuth, OpenAI GPT-5 Codex SDK, pino, Sentry (gated), Redis client
- Monorepo structure with pnpm workspaces
- PostgreSQL database with Prisma ORM
- Docker and Docker Compose for containerized deployment

## Project Structure

This project uses a **monorepo structure** managed by pnpm workspaces:

```
meal-planner-demo/          # Monorepo root
├── apps/
│   └── web/                # Next.js web application
│       ├── src/
│       │   ├── app/        # Next.js App Router pages and layouts
│       │   ├── server/     # tRPC API routes and server-side logic
│       │   ├── components/ # React components (coming soon)
│       │   └── lib/        # Utility functions and shared code (coming soon)
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

## Commands

All commands are run from the **monorepo root** and automatically delegate to the appropriate workspace:

```bash
# Development
pnpm dev              # Start Next.js dev server with Turbo (delegates to apps/web)
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
pnpm db:seed          # Seed database with sample data
pnpm db:studio        # Open Prisma Studio

# Working with specific workspaces
pnpm --filter @meal-planner-demo/web <command>    # Run command in web app
pnpm --filter @meal-planner-demo/types <command>  # Run command in types package
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

### Quality Requirements

- ESLint and Prettier are enforced in CI
- Type checking must pass (`pnpm typecheck`)
- Test with Vitest for unit tests (colocated with source files using `.test.ts` or `.test.tsx`)
- Playwright for E2E tests (coming soon)
- No `any` types allowed in code
- **All checks must pass before committing changes**
- Tests are located alongside source files for better maintainability

### Pre-Commit Checklist

**Automated Pre-Commit Hooks** are configured using Husky and lint-staged:

- **Prettier**: Auto-formats staged files (TypeScript, JavaScript, JSON, Markdown, YAML)
- **ESLint**: Auto-fixes linting issues on staged TypeScript files
- **TypeScript**: Type checks the entire codebase
- **Tests**: Runs all test suites

The hooks run automatically on `git commit`. If any check fails, the commit is blocked.

**Manual pre-commit checks** (if hooks are bypassed with `--no-verify`):

1. **Format Check**: Run `pnpm format:write` - auto-formats all code
2. **Type Checking**: Run `pnpm typecheck` - must complete with zero errors
3. **Linting**: Run `pnpm lint` - must show no errors or warnings
4. **Tests**: Run `pnpm test` - all tests must pass
5. **Build**: Run `pnpm build` (optional but recommended for major changes)

**Quick command to run all checks:**

```bash
pnpm check && pnpm format:check && pnpm build
```

**Setting up hooks after cloning:**

```bash
pnpm install  # This automatically runs 'pnpm prepare' which initializes husky
```

If any check fails, fix the issues before committing. Common issues:

- **TypeScript errors**: Check for incorrect type usage, missing imports, or wrong API methods
- **Linting errors**: Fix code style issues, unused variables, or unsafe operations
- **Test failures**: Update tests to match code changes or fix broken functionality
- **Formatting issues**: Run `pnpm format:write` to auto-format all files

### Security & Performance

- Never commit secrets or API keys
- Validate all inputs with Zod
- Use structured logging with pino
- Stream long AI responses
- Enforce rate limiting on AI endpoints

## Agent Context & Available Tools

When working in this environment, Claude Code is typically launched from the VPS and has access to:

### Direct File Access

- Full access to `/etc/dokploy/` directory for deployment logs and configuration
- Access to project files via standard file operations
- Working directory: `/home/john/meal-planner-demo/`

### MCP (Model Context Protocol) Tools Available

1. **Dokploy MCP**: Direct control over deployments, logs, and application state
   - View deployment logs in real-time
   - Access application configuration
   - Trigger redeployments if needed

2. **Chrome Headless with DevTools MCP**: Browser automation and testing
   - Run Puppeteer tests with headless browser
   - Screenshot and visual inspection of deployed application
   - Automated E2E testing against live deployment

### Standard Access

- Git operations (clone, push, pull, rebase, merge, cherry-pick)
- Docker Compose operations on the VPS
- Access to Dokploy logs at `/etc/dokploy/logs/meal-plan-demo-monostack-i9woau/`
- GitHub API via `gh` command
- Direct database access via `psql` with proper credentials

### Typical Workflow

1. Make code changes locally
2. Push to branch → Create/update PR
3. Review and merge to main
4. Dokploy automatically deploys changes
5. Check deployment via:
   - MCP Dokploy tool for real-time logs
   - Chrome headless for visual verification
   - Check `/etc/dokploy/logs/` for deployment logs

## Environment Setup

1. **Prerequisites**: Node.js 20+, pnpm 9+, Docker and Docker Compose
2. **Install dependencies**: `pnpm install`
3. **Set up environment**: Copy `.env.example` to `.env` and `apps/web/.env`
4. **Start database**: `docker compose up -d postgres redis mailpit` or `./start-database.sh`
5. **Initialize database**: `pnpm db:push`
6. **Seed data**: `pnpm db:seed` (creates test users and sample recipes)
7. **Start dev server**: `pnpm dev`

The app will be available at [http://localhost:3000](http://localhost:3000).

## Docker Deployment

The project includes Docker Compose configuration for full stack deployment:

```bash
# Build and start all services (PostgreSQL, Redis, Mailpit, web app)
docker compose up --build

# Run in detached mode
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes (including database data)
docker compose down -v
```

Services when running with Docker Compose:

- **Web App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Mailpit UI**: http://localhost:8025 (for viewing emails)

## Troubleshooting

### Deployment Failures

- **Issue**: `service "migrate" didn't complete successfully: exit 1`
  - **Solution**: Ensure docker-compose.yml uses `target: migration` for migrate and seed services
  - **Root cause**: Using `target: builder` or default stage for services that need persistent execution
  - **Fix**: Use dedicated `migration` stage in Dockerfile

- **Issue**: Recipes/ingredients not visible after deployment
  - **Solution**: Check that seed service is configured to run after migrations
  - **Verify**: Seed service should have `depends_on: { migrate: { condition: service_completed_successfully } }`

### Local Development Issues

- **TypeScript errors**: Run `pnpm typecheck` to identify issues
- **Test failures**: Run `pnpm test` and check test output
- **Docker issues**: Check `/etc/dokploy/logs/` for deployment-specific errors
- **Database not seeding**: Ensure `pnpm db:seed` runs and check for database connection errors

### Common Commands for Debugging

```bash
# Check docker compose status
docker compose ps

# View logs for a specific service
docker compose logs migrate
docker compose logs seed
docker compose logs postgres

# View Dokploy deployment logs
tail -f /etc/dokploy/logs/meal-plan-demo-monostack-i9woau/meal-plan-demo-monostack-i9woau-2025-10-*.log

# Run migrations manually
pnpm db:migrate

# Test database connection
psql postgresql://postgres:password@localhost:5432/meal-planner-demo -c "SELECT 1"

# Check Prisma schema for issues
pnpm db:push --dry-run
```

## Recent Changes

- **2025-10-26**: Fixed deployment failures by creating dedicated `migration` Docker stage
- **2025-10-26**: Added pnpm version consistency across all Dockerfile stages (PNPM_VERSION ARG)
- **2025-10-26**: Addressed all Copilot code review comments on deployment PR
- Migrated to monorepo structure with pnpm workspaces
- Added comprehensive test suite with Vitest
- Configured pre-commit hooks with Husky and lint-staged
- Added Docker Compose for full stack deployment
- 002-project-mealmind-ai: Added TypeScript (Node.js 20+) + Next.js App Router, React Server Components, tRPC, Zod, Prisma, NextAuth, OpenAI GPT-5 Codex SDK, pino, Sentry (gated), Redis client

<!-- MANUAL ADDITIONS START -->

## Critical Deployment Notes

**Docker Stages**:

- `base`: Alpine Node.js with libc6-compat and openssl
- `deps`: Installs pnpm and dependencies (node_modules)
- `builder`: Builds the application (pnpm build output)
- **`migration`**: For database operations (pnpm scripts like migrations/seeding) - DO NOT use runner or builder
- `runner`: Production-only image (Next.js standalone app)

**Why the migration stage matters**:

- Builders/runners are temporary or production-optimized - they exit after their job
- Migration stage is designed to stay running and execute commands from docker-compose
- Copying from builder gives optimized node_modules vs raw deps

<!-- MANUAL ADDITIONS END -->
