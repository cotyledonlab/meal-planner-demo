#!/bin/bash
# Verification script for monorepo structure

set -e

echo "🔍 Verifying monorepo structure..."
echo ""

# Check directory structure
echo "✅ Checking directory structure..."
for dir in apps/web packages/types packages/constants infra/postgres infra/migrations; do
  if [ -d "$dir" ]; then
    echo "  ✓ $dir exists"
  else
    echo "  ✗ $dir missing"
    exit 1
  fi
done
echo ""

# Check key files
echo "✅ Checking key files..."
for file in pnpm-workspace.yaml package.json docker-compose.yml apps/web/Dockerfile apps/web/package.json infra/postgres/migrate.sh; do
  if [ -f "$file" ]; then
    echo "  ✓ $file exists"
  else
    echo "  ✗ $file missing"
    exit 1
  fi
done
echo ""

# Check workspace configuration
echo "✅ Checking workspace configuration..."
if grep -q "apps/\*" pnpm-workspace.yaml && grep -q "packages/\*" pnpm-workspace.yaml; then
  echo "  ✓ pnpm-workspace.yaml configured correctly"
else
  echo "  ✗ pnpm-workspace.yaml misconfigured"
  exit 1
fi
echo ""

# Check Prisma migrations
echo "✅ Checking Prisma migrations..."
if [ -d "apps/web/prisma/migrations" ] && [ -d "infra/migrations" ]; then
  echo "  ✓ Migration directories exist"
  migration_count=$(find apps/web/prisma/migrations -type d -mindepth 1 | wc -l)
  echo "  ✓ Found $migration_count migration(s)"
else
  echo "  ✗ Migration directories missing"
  exit 1
fi
echo ""

# Check Docker configuration
echo "✅ Checking Docker configuration..."
if grep -q "apps/web/Dockerfile" docker-compose.yml; then
  echo "  ✓ docker-compose.yml references correct Dockerfile"
else
  echo "  ✗ docker-compose.yml Dockerfile path incorrect"
  exit 1
fi
echo ""

# Check package names
echo "✅ Checking package names..."
if grep -q "@meal-planner-demo/web" apps/web/package.json; then
  echo "  ✓ Web app package name correct"
else
  echo "  ✗ Web app package name incorrect"
  exit 1
fi

if grep -q "@meal-planner-demo/types" packages/types/package.json; then
  echo "  ✓ Types package name correct"
else
  echo "  ✗ Types package name incorrect"
  exit 1
fi

if grep -q "@meal-planner-demo/constants" packages/constants/package.json; then
  echo "  ✓ Constants package name correct"
else
  echo "  ✗ Constants package name incorrect"
  exit 1
fi
echo ""

# Check if dependencies are installed
echo "✅ Checking dependencies..."
if [ -d "node_modules" ]; then
  echo "  ✓ Root node_modules exists"
else
  echo "  ⚠ Root node_modules missing (run 'pnpm install')"
fi
echo ""

echo "✨ All verifications passed!"
echo ""
echo "Next steps:"
echo "  1. Run 'pnpm install' to install dependencies"
echo "  2. Run 'pnpm typecheck' to verify TypeScript configuration"
echo "  3. Run 'pnpm lint' to check code quality"
echo "  4. Run 'pnpm test' to run tests"
echo "  5. Run 'docker compose up --build' to test full stack"
