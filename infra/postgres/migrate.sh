#!/bin/sh
# Migration script to run database migrations on container startup

set -e

echo "Running database migrations..."

# Wait for database to be ready
MAX_RETRIES=30
RETRY_DELAY=2
retries=0

echo "Waiting for database to be ready..."
while [ $retries -lt $MAX_RETRIES ]; do
  if printf 'SELECT 1' | pnpm prisma db execute --stdin > /dev/null 2>&1; then
    echo "Database is ready!"
    break
  fi
  retries=$((retries + 1))
  echo "Database not ready yet (attempt $retries/$MAX_RETRIES), waiting ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

if [ $retries -eq $MAX_RETRIES ]; then
  echo "ERROR: Database did not become ready in time"
  exit 1
fi

echo "Running Prisma migrations..."

# Run Prisma migrations
pnpm prisma migrate deploy

echo "Migrations completed successfully!"

# Start the application
exec "$@"
