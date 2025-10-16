# Meal Planner Demo

[![CI](https://github.com/cotyledonlab/meal-planner-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/cotyledonlab/meal-planner-demo/actions/workflows/ci.yml)

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

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm check` - Run linting and type checking (recommended before commits)
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint and fix issues
- `pnpm typecheck` - Run TypeScript compiler check
- `pnpm format:check` - Check code formatting
- `pnpm format:write` - Format code (recommended before commits)
- `pnpm db:push` - Push database schema changes
- `pnpm db:generate` - Generate Prisma migrations
- `pnpm db:studio` - Open Prisma Studio

## Project Structure

```
├── prisma/          # Database schema and migrations
├── public/          # Static assets
├── src/
│   ├── app/        # Next.js App Router pages
│   ├── server/     # Server-side code (tRPC routers, auth)
│   ├── styles/     # Global styles
│   └── trpc/       # tRPC client setup
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Application Dockerfile
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
