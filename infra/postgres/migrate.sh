#!/bin/sh
# Migration script to run database migrations on container startup

set -e

echo "Running database migrations..."

# Helper: run prisma CLI regardless of local .bin symlinks
run_prisma() {
  # Prefer pnpm exec if available
  if command -v pnpm >/dev/null 2>&1; then
    pnpm exec prisma "$@"
    return $?
  fi
  # Fallback to node executing the prisma CLI directly
  if [ -f ./node_modules/prisma/build/index.js ]; then
    node ./node_modules/prisma/build/index.js "$@"
    return $?
  fi
  echo "ERROR: Prisma CLI not found. Ensure prisma is installed in production image." >&2
  return 127
}

# Wait for database to be ready by executing a simple SELECT
MAX_RETRIES=${MAX_RETRIES:-30}
RETRY_DELAY=${RETRY_DELAY:-2}
retries=0

echo "Waiting for database to be ready (DATABASE_URL=${DATABASE_URL:-unset})..."
while [ $retries -lt $MAX_RETRIES ]; do
  if printf 'SELECT 1;' | run_prisma db execute --stdin >/dev/null 2>&1; then
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
run_prisma migrate deploy

echo "Migrations completed successfully!"

# Start the application
exec "$@"
