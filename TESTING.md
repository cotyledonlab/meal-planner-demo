# Testing Guide

This document provides testing instructions for the monorepo structure and Docker deployment.

## Quick Verification

Run the verification script to ensure the monorepo structure is correct:

```bash
./verify-monorepo.sh
```

## Unit Tests

Run the test suite to verify code functionality:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Open Vitest UI
pnpm test:ui
```

## Linting and Type Checking

```bash
# Run all checks (linting + type checking)
pnpm check

# Run linting only
pnpm lint

# Run type checking only
pnpm typecheck

# Auto-fix linting issues
pnpm lint:fix
```

## Local Development Testing

### 1. Test with Local Database

```bash
# Start database services
docker compose up -d postgres redis mailpit

# Or use the convenience script
./start-database.sh

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
cp .env apps/web/.env
# Edit .env files and set AUTH_SECRET

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Visit http://localhost:3000 to verify the application works.

### 2. Test Production Build Locally

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Docker Compose Testing

### Full Stack Test

Test the complete stack including automatic migrations:

```bash
# Set up environment
cp .env.example .env
# Edit .env and set AUTH_SECRET (generate with: npx auth secret)

# Build and start all services
docker compose up --build

# Watch logs for migration execution
docker compose logs -f web
```

**Expected Output:**

1. PostgreSQL starts and becomes healthy
2. Web container builds successfully
3. Migration script runs and applies Prisma migrations
4. Application starts on port 3000

Visit http://localhost:3000 to verify the application is running.

### Individual Service Testing

Test services separately:

```bash
# Test database only
docker compose up -d postgres
docker compose exec postgres psql -U postgres -c "SELECT version();"

# Test web app build
docker compose build web

# Test web app with existing database
docker compose up web
```

### Testing Migrations

Verify migrations run automatically:

```bash
# Start fresh (removes existing data)
docker compose down -v

# Start services
docker compose up --build

# Check migration logs
docker compose logs web | grep -i migration
```

Expected output should include:

```
Running database migrations...
Waiting for database to be ready...
Database is ready!
Running Prisma migrations...
Migrations completed successfully!
```

### Testing Database Connection

Verify the web app connects to PostgreSQL:

```bash
# Check database connection from web container
docker compose exec web pnpm prisma db execute --stdin <<< "SELECT 1"

# View all tables
docker compose exec postgres psql -U postgres -d meal-planner-demo -c "\dt"
```

## Troubleshooting Tests

### Migration Failures

If migrations fail:

```bash
# Check database is accessible
docker compose exec postgres psql -U postgres -d meal-planner-demo -c "SELECT 1"

# Check migration status
docker compose exec web pnpm prisma migrate status

# Reset database (development only)
docker compose down -v
docker compose up --build
```

### Build Failures

If Docker build fails:

```bash
# Check Dockerfile syntax
docker compose config

# Build with no cache
docker compose build --no-cache web

# Check build logs
docker compose build web 2>&1 | tee build.log
```

### Connection Issues

If the app can't connect to the database:

```bash
# Verify DATABASE_URL environment variable
docker compose exec web printenv DATABASE_URL

# Test database connectivity
docker compose exec web sh -c "timeout 5 cat < /dev/tcp/postgres/5432"

# Check network connectivity
docker compose exec web ping -c 3 postgres
```

## CI/CD Testing

The repository includes CI workflows that:

1. Run linting and type checking
2. Execute unit tests
3. Verify build succeeds
4. Run security scanning

Check `.github/workflows/` for CI configuration.

## Manual Integration Testing

After deployment, manually test:

### Authentication Flow

1. Visit the application
2. Sign up with a new account
3. Sign in with existing credentials
4. Verify session persistence

### Database Operations

1. Create a post (if using the example Post model)
2. View created posts
3. Verify data persists across server restarts

### Migration Testing

1. Create a new migration locally
2. Deploy to staging/production
3. Verify migration applies successfully
4. Test rollback procedure if needed

## Performance Testing

### Load Testing with Artillery

```bash
# Install artillery
npm install -g artillery

# Create test script
cat > load-test.yml <<EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - flow:
    - get:
        url: "/"
EOF

# Run load test
artillery run load-test.yml
```

### Database Performance

```bash
# Check slow queries
docker compose exec postgres psql -U postgres -d meal-planner-demo -c "SELECT query, calls, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"
```

## Security Testing

### Dependency Scanning

```bash
# Check for vulnerabilities
pnpm audit

# Fix auto-fixable vulnerabilities
pnpm audit --fix
```

### Environment Variable Validation

```bash
# Ensure no secrets in .env files committed
git log -p | grep -i "auth_secret\|password" || echo "No secrets found in git history"

# Verify .env is gitignored
git check-ignore .env apps/web/.env
```

## Cleanup After Testing

```bash
# Stop all services
docker compose down

# Remove volumes (database data)
docker compose down -v

# Remove built images
docker compose down --rmi local

# Clean build artifacts
rm -rf apps/web/.next
rm -rf node_modules apps/web/node_modules packages/*/node_modules
```
