# Postgres Infrastructure Configuration

This directory contains the PostgreSQL database configuration and initialization scripts for the meal planner application.

## Directory Structure

- `init-scripts/` - SQL scripts run on database initialization
- `docker-compose.yml` - Postgres service configuration (deprecated, use root docker-compose.yml)

## Database Schema

The database schema is managed through Prisma migrations located in the web application (`apps/web/prisma/`). Migration files are also copied to `infra/migrations/` for reference.

## Environment Variables

Required environment variables for the database:

- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name (default: meal-planner-demo)

## Migrations

Migrations are automatically applied on web container startup via the Prisma migration system.
