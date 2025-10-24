# Database Seeding for Deployed Environments

This guide covers how to seed the database in production/staging deployments.

## The Issue

When deploying to a new environment, the database migrations run automatically via the `migrate` service, but **seeding does not happen automatically**. This causes the error:

```
No recipes available. Please seed the database first.
```

## When Seeding Is Needed

You need to seed the database in the following scenarios:

1. **Initial Deployment** - When deploying to a new environment for the first time
2. **After Database Reset** - If you've dropped and recreated the database
3. **After Data Wipe** - If you've manually deleted all recipes/ingredients
4. **Testing/Staging Environments** - To populate test data for development and QA
5. **Demo Environments** - To showcase the application with realistic sample data

**Note:** In production environments (`NODE_ENV=production`), the seed script will NOT clear existing data, making it safe to run multiple times without losing user-generated content.

## Solution Options

### Option 1: Run Seed via Docker Exec (Quick Fix)

SSH into your deployment server and run:

```bash
# Find the running web container name
docker ps | grep web

# Execute seed command in the running container
docker exec -it <container-name> sh -c "cd apps/web && pnpm db:seed"

# Or if using docker compose:
docker compose exec web sh -c "cd apps/web && pnpm db:seed"
```

### Option 2: Run Seed as One-Time Service (Recommended)

The `docker-compose.yml` now includes a `seed` service that can be run on-demand:

```bash
# Run seed service (uses profile to prevent auto-start)
docker compose --profile seed run --rm seed

# Or with explicit compose file
docker compose -f docker-compose.yml --profile seed run --rm seed
```

### Option 3: Dokploy/CI Pipeline Integration

If you're using Dokploy or a CI/CD pipeline, add a post-deployment step:

**For Dokploy:**

1. Go to your application settings
2. Add a "Post Deploy Command":
   ```bash
   docker compose --profile seed run --rm seed || echo "Seed already completed or failed (this is OK on re-deploys)"
   ```

**For GitHub Actions / GitLab CI:**

```yaml
- name: Seed Database
  run: |
    docker compose --profile seed run --rm seed
  # Only run on first deploy or when FORCE_SEED=true
  if: github.event.deployment.first_deploy == true
```

### Option 4: Manual Seed from Local Machine

If you have direct database access via DATABASE_URL:

```bash
# Set the production DATABASE_URL
export DATABASE_URL="postgresql://user:pass@production-host:5432/meal-planner-demo"

# Run seed locally (connects to remote DB)
cd apps/web
pnpm db:seed
```

⚠️ **Warning:** Only do this if you trust your local network and have proper credentials.

## What Gets Seeded

The seed script populates:

- **22 recipes** (various cuisines, dietary preferences including quick meals, batch-prep options, and one-pot dinners)
- **57 ingredients** (categorized: protein, vegetables, dairy, grains, pantry staples)
- **2 test users:**
  - `premium@example.com` / `P@ssw0rd!` (7-day meal plans)
  - `basic@example.com` / `P@ssw0rd!` (3-day meal plans)
- **Price baselines** for Irish supermarkets (Aldi, Lidl, Tesco, Dunnes) for shopping list cost estimation

## Idempotency

The seed script is **idempotent** in non-production environments - it clears existing data before seeding. In production (`NODE_ENV=production`), it will **NOT** clear existing data, so it's safe to run multiple times.

## Verifying the Seed

After seeding, verify recipes exist:

```bash
# Via Docker exec
docker compose exec web node -e "import('@prisma/client').then(async ({PrismaClient}) => { const db = new PrismaClient(); console.log('Recipes:', await db.recipe.count()); await db.\$disconnect(); })"

# Expected output:
# Recipe count: 12
```

## Troubleshooting

### "Connection Closed" Errors

This usually means:

1. Database isn't fully ready (wait for healthcheck)
2. DATABASE_URL is incorrect
3. Network connectivity issues between containers

Check:

```bash
docker compose exec web env | grep DATABASE_URL
docker compose logs postgres
```

### Seed Hangs or Times Out

The seed script imports `bcryptjs` which can be slow. This is expected and may take 30-60 seconds.

### Permission Denied

Ensure the container has write access to run pnpm scripts:

```bash
docker compose exec web ls -la apps/web/prisma
```

### "No recipes available" Error After Deployment

This error indicates the database has not been seeded. To fix:

1. Check if migrations ran successfully: `docker compose logs migrate`
2. Run the seed service: `docker compose --profile seed run --rm seed`
3. Verify recipes exist (see "Verifying the Seed" section above)

### Seed Script Fails on Missing Dependencies

If you see errors about missing packages or dependencies:

```bash
# Rebuild the seed container with fresh dependencies
docker compose build seed
docker compose --profile seed run --rm seed
```

## Production Best Practices

1. **Don't auto-seed in production** - Use the profile approach to make it explicit
2. **Create production users separately** - Don't rely on test users in production
3. **Backup before seeding** - If you're re-seeding, backup first:
   ```bash
   docker compose exec postgres pg_dump -U postgres meal-planner-demo > backup.sql
   ```
4. **Monitor the seed job** - Use proper logging and alerting for seed failures

## Alternatives to Seeding

For production, consider:

1. **Import real recipe data** - Replace test recipes with curated content
2. **Admin panel** - Build a UI for adding recipes instead of running seeds
3. **Migration-based defaults** - Add essential data via Prisma migrations
4. **Lazy loading** - Show a setup wizard on first use

## Future Improvements

Consider adding:

- A `/api/health/seed-status` endpoint that checks if recipes exist
- A banner in the UI: "No recipes found. Please contact admin."
- Seed progress indicators and logs
- Partial seed options (recipes only, users only, etc.)
