#!/bin/sh
# Migration script to run database migrations on container startup

set -e

echo "Running database migrations..."

# Wait for database to be ready
until nc -z postgres 5432; do
  echo "Waiting for database to be ready..."
  sleep 2
done

echo "Database is ready, running migrations..."

# Run Prisma migrations
pnpm prisma migrate deploy

echo "Migrations completed successfully!"

# Start the application
exec "$@"
