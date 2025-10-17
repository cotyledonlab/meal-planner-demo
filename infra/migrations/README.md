# Database Migrations

This directory contains copies of Prisma database migrations for reference and documentation purposes.

## Migration Management

Migrations are managed using Prisma and are located in the web application at `apps/web/prisma/migrations/`.

The migrations in this directory are copies for reference and historical tracking. The source of truth is the Prisma migrations in the web app.

## Current Schema

The current schema includes:

- **User Authentication Tables**: User, Account, Session, Password, VerificationToken
- **Application Tables**: Post (example data model)

## Running Migrations

Migrations are automatically applied when the web container starts up using the `infra/postgres/migrate.sh` script.

To manually run migrations:

```bash
# From the root directory
pnpm db:migrate

# Or from apps/web directory
cd apps/web && pnpm db:migrate
```

## Creating New Migrations

To create a new migration:

```bash
# From the root directory
pnpm db:generate

# Or from apps/web directory
cd apps/web && pnpm db:generate
```

After creating a new migration, copy it to this directory for reference:

```bash
cp -r apps/web/prisma/migrations/* infra/migrations/
```
