#!/bin/sh
# Migration script to run database migrations on container startup

set -e

echo "Running database migrations..."

# Locate Prisma project directory. Default to apps/web when present.
find_prisma_project_dir() {
  if [ -n "${PRISMA_PROJECT_DIR:-}" ]; then
    echo "$PRISMA_PROJECT_DIR"
    return 0
  fi

  if [ -d "apps/web/prisma" ]; then
    echo "apps/web"
    return 0
  fi

  if [ -d "prisma" ]; then
    echo "."
    return 0
  fi

  echo "ERROR: Unable to locate Prisma project. Set PRISMA_PROJECT_DIR." >&2
  return 1
}

PRISMA_PROJECT_PATH=$(find_prisma_project_dir) || exit 1
cd "$PRISMA_PROJECT_PATH"

PRISMA_SCHEMA_PATH=${PRISMA_SCHEMA_PATH:-prisma/schema.prisma}
PRISMA_MIGRATIONS_DIR=${PRISMA_MIGRATIONS_DIR:-$(dirname "$PRISMA_SCHEMA_PATH")/migrations}

if [ ! -f "$PRISMA_SCHEMA_PATH" ]; then
  echo "ERROR: Prisma schema not found at $PRISMA_SCHEMA_PATH" >&2
  exit 1
fi

# Helper: run prisma CLI regardless of local .bin symlinks
run_prisma() {
  # Prefer pnpm exec if available
  if command -v pnpm >/dev/null 2>&1; then
    pnpm exec prisma "$@" --schema="$PRISMA_SCHEMA_PATH"
    return $?
  fi
  # Fallback to node executing the prisma CLI directly
  if [ -f ./node_modules/prisma/build/index.js ]; then
    node ./node_modules/prisma/build/index.js "$@" --schema="$PRISMA_SCHEMA_PATH"
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
db_check_logged=0

db_ready_check() {
  printf 'SELECT 1;' | run_prisma db execute --stdin
}

while [ $retries -lt $MAX_RETRIES ]; do
  if db_ready_check >/dev/null 2>&1; then
    echo "Database is ready!"
    break
  fi
  retries=$((retries + 1))
  if [ $db_check_logged -eq 0 ]; then
    echo "Database readiness check failed; Prisma output:" >&2
    db_ready_check 2>&1 | sed 's/^/  /' >&2
    db_check_logged=1
  fi
  echo "Database not ready yet (attempt $retries/$MAX_RETRIES), waiting ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

if [ $retries -eq $MAX_RETRIES ]; then
  echo "ERROR: Database did not become ready in time"
  exit 1
fi

echo "Running Prisma migrations..."

# Handle environments where the database already contains the expected schema but lacks Prisma history.
baseline_existing_schema() {
  echo "Existing schema detected with no Prisma migration history; marking migrations as applied..."

  if [ ! -d "$PRISMA_MIGRATIONS_DIR" ]; then
    echo "No migration directory found at $PRISMA_MIGRATIONS_DIR; skipping baseline." >&2
    return 0
  fi

  for migration_path in "$PRISMA_MIGRATIONS_DIR"/*; do
    [ -d "$migration_path" ] || continue

    migration_name=$(basename "$migration_path")
    echo "Marking $migration_name as applied"
    run_prisma migrate resolve --applied "$migration_name"
  done
}

# Run migrations and fall back to baselining if Prisma reports a non-empty schema with no history.
run_migrate_deploy() {
  set +e
  deploy_output=$(run_prisma migrate deploy 2>&1)
  deploy_status=$?
  set -e

  printf '%s\n' "$deploy_output"

  if [ $deploy_status -eq 0 ]; then
    return 0
  fi

  if printf '%s' "$deploy_output" | grep -q "P3005"; then
    baseline_existing_schema
    echo "Retrying Prisma migrations after baselining..."
    run_prisma migrate deploy
    return $?
  fi

  return $deploy_status
}

if ! run_migrate_deploy; then
  echo "ERROR: Prisma migrations failed"
  exit 1
fi

echo "Migrations completed successfully!"

# Start the application if a command was provided
if [ "$#" -gt 0 ]; then
  exec "$@"
fi
