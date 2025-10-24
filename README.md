# Meal Planner Demo

[![CI](https://github.com/cotyledonlab/meal-planner-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/cotyledonlab/meal-planner-demo/actions/workflows/ci.yml)

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`, organized as a monorepo with integrated PostgreSQL database support.

## Project Structure

This project uses a monorepo structure managed by pnpm workspaces:

```
meal-planner-demo/
├── apps/
│   └── web/                 # Next.js web application
│       ├── src/             # Application source code
│       ├── prisma/          # Database schema and migrations
│       ├── public/          # Static assets
│       └── Dockerfile       # Web app container configuration
├── packages/
│   ├── types/               # Shared TypeScript types
│   └── constants/           # Shared constants
├── infra/
│   ├── postgres/            # PostgreSQL configuration
│   │   ├── migrate.sh       # Database migration script
│   │   └── README.md        # Infrastructure documentation
│   └── migrations/          # Migration history (reference)
├── Dockerfile               # Root-level Dockerfile (same as apps/web/Dockerfile)
├── docker-compose.yml       # Full stack orchestration
├── pnpm-workspace.yaml      # Workspace configuration
└── package.json             # Root package with workspace scripts
```

## Tech Stack

This project uses the following technologies:

- [Next.js](https://nextjs.org) - React framework with App Router
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- [TypeScript](https://www.typescriptlang.org/) - Type safety

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

4. Start the database and supporting services:

```bash
docker compose up -d postgres redis mailpit
```

Or use the provided script:

```bash
./start-database.sh
```

5. Set up the database:

```bash
pnpm db:push
```

6. **Seed the database with initial data:**

```bash
pnpm db:seed
```

This creates essential data for the application:

- **22 sample recipes** covering various cuisines and dietary preferences
- **57 ingredients** across all major food categories
- **2 test users** for development:
  - **Premium user**: `premium@example.com` / `P@ssw0rd!` (7-day meal plans)
  - **Basic user**: `basic@example.com` / `P@ssw0rd!` (3-day meal plans)
- **Price baselines** for Irish supermarkets (Aldi, Lidl, Tesco, Dunnes)

Alternatively, you can seed from the web app directory:

```bash
cd apps/web && pnpm prisma db seed
```

> 📝 **Important**: Without seeding, the app will show "No recipes available" errors. See [SEEDING_DEPLOYMENT.md](./SEEDING_DEPLOYMENT.md) for production seeding instructions.

7. Start the development server:

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Docker Compose Deployment

Deploy the entire stack (PostgreSQL, Redis, Mailpit, and web app) with Docker Compose:

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

> ⚠️ **Note**: Database seeding does NOT happen automatically. You must manually seed the database after the first deployment. See the next section for instructions.

### Seeding the Database in Docker

After starting the services for the first time, you need to seed the database with initial data:

```bash
# Run the seed service (uses profile to prevent auto-start)
docker compose --profile seed run --rm seed
```

This command:

- Runs a one-time container to seed the database
- Creates 22 sample recipes, 57 ingredients, 2 test users, and price baselines
- Exits automatically after completion (--rm flag removes the container)

**When to seed:**

- After first deployment to a new environment
- After resetting or wiping the database
- In testing/staging environments to populate test data

For more detailed seeding instructions, troubleshooting, and production considerations, see [SEEDING_DEPLOYMENT.md](./SEEDING_DEPLOYMENT.md).

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

When running with Docker Compose:

- **Web App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Mailpit UI**: http://localhost:8025 (for viewing emails)
- **Mailpit SMTP**: localhost:1025

## Development Scripts

All scripts are run from the root directory and delegated to the appropriate workspace:

### Development

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm preview` - Build and start production server

### Code Quality

- `pnpm check` - Run linting and type checking
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint and fix issues
- `pnpm typecheck` - Run TypeScript compiler check
- `pnpm format:check` - Check code formatting
- `pnpm format:write` - Format code

### Testing

- `pnpm test` - Run all unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Open Vitest UI for interactive testing
- `pnpm test:coverage` - Run tests with coverage report

### Database

- `pnpm db:push` - Push database schema changes
- `pnpm db:generate` - Generate Prisma migrations
- `pnpm db:migrate` - Run Prisma migrations in production
- `pnpm db:seed` - Seed database with sample data (users, recipes, ingredients)
- `pnpm db:studio` - Open Prisma Studio

### Working with Individual Packages

To run commands in a specific workspace:

```bash
# In the web app
pnpm --filter @meal-planner-demo/web <command>

# In shared packages
pnpm --filter @meal-planner-demo/types typecheck
pnpm --filter @meal-planner-demo/constants typecheck
```

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing with comprehensive test coverage.

### Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Open Vitest UI for interactive testing
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

### Test Structure

Tests are colocated with the source files they test, using the `.test.ts` or `.test.tsx` extension:

```
apps/web/src/
├── server/
│   ├── api/
│   │   ├── root.ts
│   │   ├── root.test.ts          # Tests for root router
│   │   ├── routers/
│   │   │   ├── post.ts
│   │   │   └── post.test.ts      # Tests for post router
│   │   ├── trpc.ts
│   │   └── trpc.test.ts          # Tests for tRPC setup
│   ├── db.ts
│   └── db.test.ts                # Tests for database utilities
└── test/
    ├── setup.ts                  # Test setup and global config
    └── mocks.ts                  # Shared mocks and utilities
```

### Test Coverage

The test suite provides comprehensive coverage for:

- **tRPC Routers**: All API endpoints and their authentication requirements
- **Database Layer**: Database client initialization and configuration
- **API Context**: tRPC context creation and session handling

Coverage excludes:

- UI components (Next.js pages and React components)
- Configuration files
- Entry points and route handlers
- Environment validation

To view the coverage report after running tests:

```bash
pnpm test:coverage
# Open coverage/index.html in your browser for detailed report
```

### Writing Tests

Tests use Vitest's testing utilities and mock external dependencies:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { postRouter } from "./post";
import { createMockContext } from "~/test/mocks";

describe("postRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a greeting", async () => {
    const ctx = createMockContext();
    const caller = postRouter.createCaller(ctx);
    const result = await caller.hello({ text: "World" });

    expect(result.greeting).toBe("Hello World");
  });
});
```

### Continuous Integration

Tests run automatically on:

- Pull requests
- Pushes to main branch
- Pre-deployment checks

All tests must pass before code can be merged.

## Project Structure

```
meal-planner-demo/                # Monorepo root
├── apps/
│   └── web/                      # Next.js web application
│       ├── prisma/               # Database schema and migrations
│       ├── public/               # Static assets
│       ├── src/
│       │   ├── app/              # Next.js App Router pages
│       │   ├── server/           # Server-side code (tRPC routers, auth)
│       │   ├── styles/           # Global styles
│       │   ├── test/             # Test utilities and mocks
│       │   └── trpc/             # tRPC client setup
│       ├── Dockerfile            # Web app container configuration
│       └── vitest.config.ts      # Vitest configuration
├── packages/
│   ├── types/                    # Shared TypeScript types
│   └── constants/                # Shared constants
├── infra/
│   ├── postgres/                 # PostgreSQL infrastructure
│   │   ├── migrate.sh            # Migration script for container startup
│   │   └── README.md             # Infrastructure documentation
│   └── migrations/               # Migration history (reference copy)
├── coverage/                     # Test coverage reports (git-ignored)
├── docker-compose.yml            # Full stack orchestration
├── pnpm-workspace.yaml           # Workspace configuration
└── package.json                  # Root package with workspace scripts
```

## Learn More

To learn more about the T3 Stack:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available)
- [T3 Stack GitHub](https://github.com/t3-oss/create-t3-app)

## AI Assistant Guidelines

Development guidelines for AI assistants (GitHub Copilot, Cursor, etc.) are maintained in **`AGENTS.md`** at the repository root. This consolidated file contains:

- Project overview and core flow
- Active technologies and versions
- Project structure
- Development commands
- Code style and guidelines
- Security and performance requirements

All AI assistant configurations have been consolidated into this single file for consistency and ease of maintenance.

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

## Project Documentation

Additional project specifications and documentation can be found in the `specs/` directory.
