# Meal Planner Demo

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

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
```

Edit `.env` and fill in the required values.

4. Start the database (using the provided script):

```bash
./start-database.sh
```

Or manually start PostgreSQL on port 5432.

5. Set up the database:

```bash
pnpm db:push
```

6. Start the development server:

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Docker Compose Deployment

Deploy the entire stack (database, redis, mailpit, and web app) with Docker Compose:

1. Ensure Docker and Docker Compose are installed

2. Build and start all services:

```bash
docker compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

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
- `pnpm db:studio` - Open Prisma Studio

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
src/
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
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { postRouter } from './post';
import { createMockContext } from '~/test/mocks';

describe('postRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a greeting', async () => {
    const ctx = createMockContext();
    const caller = postRouter.createCaller(ctx);
    const result = await caller.hello({ text: 'World' });
    
    expect(result.greeting).toBe('Hello World');
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
├── prisma/          # Database schema and migrations
├── public/          # Static assets
├── src/
│   ├── app/        # Next.js App Router pages
│   ├── server/     # Server-side code (tRPC routers, auth)
│   ├── styles/     # Global styles
│   ├── test/       # Test utilities and mocks
│   └── trpc/       # tRPC client setup
├── coverage/        # Test coverage reports (git-ignored)
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Application Dockerfile
├── vitest.config.ts    # Vitest configuration
└── package.json
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

## Project Documentation

Additional project specifications and documentation can be found in the `specs/` directory.
