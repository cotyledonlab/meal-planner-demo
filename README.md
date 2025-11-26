# Meal Planner Demo

[![CI](https://github.com/cotyledonlab/meal-planner-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/cotyledonlab/meal-planner-demo/actions/workflows/ci.yml)

This Next.js 15 (App Router) monorepo uses strict TypeScript, tRPC v11, Prisma 6 with PostgreSQL, React Query, Tailwind CSS 4, and Prettier/ESLint enforcement.

## Documentation Index

- **Repository Reference:** [`docs/REFERENCE.md`](docs/REFERENCE.md) — canonical commands, stack summary, and environment setup
- **Deployment:** [`DEPLOYMENT.md`](DEPLOYMENT.md) and [`SEEDING_DEPLOYMENT.md`](SEEDING_DEPLOYMENT.md)
- **Testing:** [`TESTING.md`](TESTING.md)
- **Auth & UX Plans:** [`docs/AUTH.md`](docs/AUTH.md), [`docs/AUTH_DASHBOARD_UI_PLAN.md`](docs/AUTH_DASHBOARD_UI_PLAN.md)
- **Database Notes:** [`docs/DATABASE_CONFIGURATION.md`](docs/DATABASE_CONFIGURATION.md), [`docs/DATABASE_FIXES_SUMMARY.md`](docs/DATABASE_FIXES_SUMMARY.md)
- **Meal Planning Feature:** [`docs/MEAL_PLANNING_FEATURE.md`](docs/MEAL_PLANNING_FEATURE.md)
- **AI Assistant Guidelines:** [`AGENTS.md`](AGENTS.md)

Use the reference doc for the latest command list and stack details; other guides link back to it to keep documentation DRY.

## Project Structure

This project uses a monorepo structure managed by pnpm workspaces:

```
meal-planner-demo/
├── apps/
│   └── web/                 # Next.js web application (app router, tRPC, Prisma)
│       ├── src/             # Application source code
│       ├── prisma/          # Database schema and migrations
│       ├── public/          # Static assets
│       └── vitest.config.ts # Testing configuration
├── packages/
│   ├── types/               # Shared TypeScript types
│   └── constants/           # Shared constants
├── infra/
│   ├── postgres/            # PostgreSQL configuration and migration script
│   └── migrations/          # Migration history (reference)
├── docs/                    # Feature and operations documentation
├── Dockerfile               # Production build (Next.js standalone)
├── docker-compose.yml       # Full stack orchestration
├── pnpm-workspace.yaml      # Workspace configuration
└── package.json             # Root package with workspace scripts
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker and Docker Compose (for containerized deployment)

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/cotyledonlab/meal-planner-demo.git
cd meal-planner-demo
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up your environment variables:

```bash
cp .env.example .env
cp .env apps/web/.env
```

Edit `.env` and `apps/web/.env` and fill in the required values.

4. Start the database (and optional local mail relay):

```bash
docker compose up -d postgres
```

Need Mailpit locally? Run the composed stack instead:

```bash
pnpm docker:dev
```

Or use the provided script for a standalone Postgres container:

```bash
./start-database.sh
```

5. Set up the database:

```bash
pnpm db:push
```

6. Seed the database with test data and users:

```bash
pnpm db:seed
```

Alternatively, from the web app directory:

```bash
cd apps/web && pnpm prisma db seed
```

This will create:

- **Premium user**: `premium@example.com` / `P@ssw0rd!`
- **Basic user**: `basic@example.com` / `P@ssw0rd!`
- 22 diverse sample recipes with ingredients (quick meals, batch-prep options, and one-pot dinners)
- Price baselines for Irish supermarkets (Aldi, Lidl, Tesco, Dunnes)

7. Start the development server:

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000). Consult [`docs/REFERENCE.md`](docs/REFERENCE.md) for the canonical command list and environment details.

### Docker Compose Deployment

Deploy the production stack (PostgreSQL and web app) with Docker Compose:

1. Ensure Docker and Docker Compose are installed

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env and set AUTH_SECRET (generate with: npx auth secret)
```

3. Build and start all services:

```bash
docker compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

**What happens on startup:**

- PostgreSQL starts and becomes healthy
- Web app container builds with the monorepo structure
- Database migrations run automatically via `infra/postgres/migrate.sh`
- Web application starts and connects to the database

To run in detached mode:

```bash
docker compose up -d --build
```

To stop all services:

```bash
docker compose down
```

To stop and remove volumes (including database data):

```bash
docker compose down -v
```

### Available Services

When running the base Docker Compose file (used for production deployments):

- **Web App**: http://localhost:3000
- **PostgreSQL**: localhost:5432

For local development, add the Mailpit service by running:

```bash
pnpm docker:dev
```

This command composes `docker-compose.yml` with `docker-compose.dev.yml`, exposing Mailpit on http://localhost:8025. SMTP configuration details live in [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Commands & Testing

Scripts for development, quality checks, testing, and database workflows are listed in [`docs/REFERENCE.md`](docs/REFERENCE.md). Testing workflows and structure are documented in [`TESTING.md`](TESTING.md); the project uses Vitest with tests colocated alongside source files.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:

- Setting up your development environment
- Code quality standards and best practices
- Pre-merge CI checks (linting, type checking, formatting, build, security)
- How to resolve common CI failures
- Pull request process

### Quick Pre-Commit Checklist

Before submitting a PR, ensure:

```bash
pnpm check         # Lint + type check
pnpm format:write  # Auto-format code
pnpm build         # Verify build succeeds
```

All pull requests must pass automated CI checks including linting, type checking, formatting validation, build verification, and security scanning.

## Learn More

Additional project specifications live in the `docs/` directory. Refer to [`docs/REFERENCE.md`](docs/REFERENCE.md) for the canonical command list and stack notes.
