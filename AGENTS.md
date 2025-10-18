# meal-planner-demo Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-15

## Project Overview

MealMind AI is an AI-powered meal planning demo for friends/family. The core flow covers:

- Preference intake → 7-day meal plans → recipes → shopping lists → edits → export/share
- Only build features traceable to this core loop

## Active Technologies

- TypeScript (Node.js 20+) + Next.js App Router, React Server Components, tRPC, Zod, Prisma, NextAuth, OpenAI GPT-5 Codex SDK, pino, Sentry (gated), Redis client (002-project-mealmind-ai)

## Project Structure

```
src/
  app/              # Next.js App Router pages and layouts
  server/           # tRPC API routes and server-side logic
  components/       # React components
  lib/              # Utility functions and shared code
prisma/             # Database schema and migrations
specs/              # Feature specifications and plans
public/             # Static assets
```

## Commands

```bash
# Development
pnpm dev              # Start Next.js dev server with Turbo
pnpm build            # Build production bundle
pnpm start            # Start production server
pnpm preview          # Build and start production server

# Testing & Quality
pnpm check            # Run linting and type checking
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues automatically
pnpm typecheck        # Run TypeScript type checking
pnpm format:check     # Check code formatting
pnpm format:write     # Format code with Prettier

# Database
pnpm db:generate      # Generate Prisma client and run migrations
pnpm db:migrate       # Run Prisma migrations in production
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Prisma Studio
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

- PostgreSQL via Prisma ORM
- All schema changes via Prisma migrations
- Include rollback scripts for migrations

### Quality Requirements

- ESLint and Prettier are enforced in CI
- Type checking must pass (`pnpm typecheck`)
- Test with Vitest for units, Playwright for E2E
- No `any` types allowed in code
- **All checks must pass before committing changes**

### Pre-Commit Checklist

**Automated Pre-Commit Hooks** are configured using Husky and lint-staged:

- **Prettier**: Auto-formats staged files (TypeScript, JavaScript, JSON, Markdown, YAML)
- **ESLint**: Auto-fixes linting issues on staged TypeScript files
- **TypeScript**: Type checks the entire codebase
- **Tests**: Runs all test suites

The hooks run automatically on `git commit`. If any check fails, the commit is blocked.

**Manual pre-commit checks** (if hooks are bypassed with `--no-verify`):

1. **Type Checking**: Run `pnpm typecheck` - must complete with zero errors
2. **Linting**: Run `SKIP_ENV_VALIDATION=1 pnpm lint` (in apps/web) - must show no errors or warnings
3. **Tests**: Run `pnpm test` - all tests must pass
4. **Build**: Run `pnpm build` (optional but recommended for major changes)

**Command to run all checks:**

```bash
cd /path/to/meal-planner-demo
pnpm typecheck && cd apps/web && SKIP_ENV_VALIDATION=1 pnpm lint && cd ../.. && pnpm test
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

## Recent Changes

- 002-project-mealmind-ai: Added TypeScript (Node.js 20+) + Next.js App Router, React Server Components, tRPC, Zod, Prisma, NextAuth, OpenAI GPT-5 Codex SDK, pino, Sentry (gated), Redis client

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
