# Deployment Guide

This document provides instructions for deploying the Meal Planner Demo application in a monorepo structure.

## Architecture Overview

The application is organized as a monorepo with:
- **apps/web**: Next.js web application
- **packages/**: Shared utilities (types, constants)
- **infra/**: Infrastructure configuration (Postgres, migrations)

All components are orchestrated via Docker Compose for consistent local and production deployments.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and pnpm 9+ (for local development)
- PostgreSQL database (local or managed service)

## Environment Variables

The application requires environment variables at multiple levels:

### Root Level (.env)
Copy `.env.example` to `.env` and configure:

```bash
# Authentication
AUTH_SECRET=your-generated-secret  # Generate with: npx auth secret
AUTH_DISCORD_ID=                   # Optional: Discord OAuth client ID
AUTH_DISCORD_SECRET=               # Optional: Discord OAuth client secret

# Database (local development)
DATABASE_URL=postgresql://postgres:password@localhost:5432/meal-planner-demo
```

### Web App Level (apps/web/.env)
Copy the root `.env` to `apps/web/.env`:

```bash
cp .env apps/web/.env
```

For production/Dokploy deployments, set these via environment secrets in your deployment platform.

## Deployment Options

### Option 1: Docker Compose (Recommended)

Deploy the complete stack (PostgreSQL, Redis, Mailpit, and the web application) using the monorepo structure:

```bash
# 1. Set up environment variables
cp .env.example .env
# Edit .env and set AUTH_SECRET (generate with: npx auth secret)

# 2. Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up -d --build
```

**What happens during deployment:**
1. PostgreSQL, Redis, and Mailpit services start
2. Web application builds using the monorepo Dockerfile (`apps/web/Dockerfile`)
3. Build process:
   - Installs workspace dependencies
   - Copies shared packages (types, constants)
   - Generates Prisma client
   - Builds Next.js application
4. On container startup:
   - Migration script (`infra/postgres/migrate.sh`) runs automatically
   - Prisma migrations are applied to the database
   - Application starts and connects to PostgreSQL

Services will be available at:
- **Application**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Mailpit Web UI**: http://localhost:8025

To stop all services:

```bash
docker compose down
```

To stop and remove volumes (including database data):

```bash
docker compose down -v
```

### Option 2: Local Development

1. **Install dependencies** (from repository root):

```bash
pnpm install
```

2. **Start backing services** (PostgreSQL, Redis, Mailpit):

```bash
docker compose up -d postgres redis mailpit
```

Or use the provided script:

```bash
./start-database.sh
```

3. **Set up environment variables**:

```bash
cp .env.example .env
cp .env apps/web/.env
# Edit both .env files with your configuration
```

4. **Set up the database**:

```bash
pnpm db:push
```

5. **Start the development server**:

```bash
pnpm dev
```

The application will be available at http://localhost:3000.

### Option 3: Production Build (Local)

1. Follow steps 1-4 from "Local Development"

2. **Build the application**:

```bash
pnpm build
```

3. **Start the production server**:

```bash
pnpm start
```

## Docker Build Notes

The Dockerfile uses a multi-stage build process optimized for the monorepo structure:

1. **Base stage**: Sets up Node.js 20 Alpine with netcat-openbsd for health checks
2. **Dependencies stage**: 
   - Copies workspace configuration (pnpm-workspace.yaml, root package.json)
   - Copies all workspace package.json files
   - Installs dependencies with pnpm frozen lockfile
3. **Builder stage**: 
   - Copies shared packages (types, constants)
   - Generates Prisma client
   - Builds the Next.js application
4. **Runner stage**: 
   - Creates optimized production image using Next.js standalone output
   - Includes Prisma client and migration tools
   - Copies migration script for automatic database setup
   - Runs migrations on container startup

The build uses Next.js standalone output for minimal image size while maintaining the ability to run database migrations.

## Dokploy Deployment

[Dokploy](https://dokploy.com/) is a self-hosted Platform-as-a-Service that simplifies deployment of containerized applications.

### Prerequisites

- Dokploy instance set up and running
- PostgreSQL database provisioned (can use Dokploy's managed Postgres service)
- Domain name configured (optional, but recommended for production)

### Deployment Steps

#### Option 1: Single Stack Deployment (Recommended)

Deploy both the web app and database as a single docker-compose stack:

1. **Create a new Compose Application in Dokploy**
   - Name: `meal-planner-demo`
   - Repository: `https://github.com/cotyledonlab/meal-planner-demo`
   - Branch: `main`

2. **Configure Environment Variables** in Dokploy dashboard:
   ```bash
   AUTH_SECRET=<generate-with-npx-auth-secret>
   DATABASE_URL=postgresql://postgres:password@postgres:5432/meal-planner-demo
   NEXTAUTH_URL=https://your-domain.com
   NODE_ENV=production
   SKIP_ENV_VALIDATION=1
   
   # Optional OAuth
   AUTH_DISCORD_ID=<your-discord-client-id>
   AUTH_DISCORD_SECRET=<your-discord-client-secret>
   ```

3. **Use the existing docker-compose.yml**
   - Dokploy will automatically use the `docker-compose.yml` at the repository root
   - This includes postgres, redis, mailpit, and web services
   - Migrations run automatically on web container startup

4. **Deploy**
   - Click "Deploy" in Dokploy dashboard
   - Monitor build logs for any errors
   - Once deployed, access your app at the configured domain

#### Option 2: Separate App and Database

Deploy web app and database as separate Dokploy applications:

1. **Create PostgreSQL Database in Dokploy**
   - Create a new Postgres service
   - Note the connection URL
   - Configure persistence volume for data retention

2. **Create Web Application**
   - Create new Docker application in Dokploy
   - Repository: `https://github.com/cotyledonlab/meal-planner-demo`
   - Dockerfile path: `apps/web/Dockerfile`
   - Build context: Repository root (`.`)

3. **Configure Environment Variables**:
   ```bash
   AUTH_SECRET=<generate-with-npx-auth-secret>
   DATABASE_URL=<postgres-connection-url-from-dokploy>
   NEXTAUTH_URL=https://your-domain.com
   NODE_ENV=production
   SKIP_ENV_VALIDATION=1
   ```

4. **Configure Port Mapping**
   - Container port: `3000`
   - Host port: Your choice (e.g., `3000` or let Dokploy assign)

5. **Deploy**
   - Click "Deploy"
   - Migrations will run automatically on first startup

### Database Migrations on Dokploy

Migrations are handled automatically via the `infra/postgres/migrate.sh` script:

- Script runs on container startup (before the web app starts)
- Waits for database to be ready using health checks
- Executes `prisma migrate deploy` to apply pending migrations
- Only proceeds to start the app after successful migration

To manually run migrations (if needed):

```bash
# SSH into Dokploy server
dokploy exec <app-name> -- pnpm --filter @meal-planner-demo/web db:migrate
```

### Environment-Specific Configuration

#### Development/Staging
```bash
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host:5432/meal-planner-dev
NEXTAUTH_URL=https://staging.your-domain.com
```

#### Production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/meal-planner-prod
NEXTAUTH_URL=https://your-domain.com
# Ensure AUTH_SECRET is cryptographically secure
```

### Monitoring and Logs

- **Application Logs**: View in Dokploy dashboard under application logs
- **Database Logs**: View in Dokploy dashboard under Postgres service logs
- **Migration Logs**: Visible in application startup logs

### Scaling Considerations

- **Database**: Use Dokploy's managed Postgres with appropriate instance size
- **Web App**: Configure multiple replicas in Dokploy (stateless design supports horizontal scaling)
- **Redis**: Use managed Redis service for session storage across replicas
- **Storage**: Configure persistent volumes for database and uploaded files

### Troubleshooting Dokploy Deployments

**Build Failures:**
- Ensure Dokploy has access to the GitHub repository
- Check build logs for missing dependencies
- Verify Dockerfile path is correct (`apps/web/Dockerfile`)
- Ensure build context is repository root

**Migration Failures:**
- Check database connection string is correct
- Verify database service is healthy before web app starts
- Review migration logs in application startup logs
- Manually connect to database to verify schema state

**Connection Issues:**
- Verify `DATABASE_URL` environment variable is set correctly
- Ensure database and web app can communicate (network/security groups)
- Check if database service is running and healthy
- Verify `NEXTAUTH_URL` matches your domain configuration

### Backup and Recovery

**Database Backups:**
```bash
# On Dokploy server
dokploy backup postgres <service-name>
```

**Restore from Backup:**
```bash
dokploy restore postgres <service-name> <backup-file>
```

Recommended: Set up automated daily backups in Dokploy configuration.

## Database Migrations

Migrations are managed using Prisma and stored in `apps/web/prisma/migrations/`. Reference copies are maintained in `infra/migrations/` for documentation.

### Automatic Migrations (Docker/Dokploy)

When deploying with Docker or Dokploy, migrations run automatically via `infra/postgres/migrate.sh`:

1. Container starts
2. Script waits for database to be ready (health check)
3. Executes `pnpm prisma migrate deploy`
4. Application starts after successful migration

### Manual Migrations

For local development or manual deployment:

```bash
# Apply all pending migrations
pnpm db:migrate

# Or from apps/web directory
cd apps/web && pnpm db:migrate
```

### Creating New Migrations

When you modify the Prisma schema:

```bash
# Generate migration and apply to dev database
pnpm db:generate

# Or from apps/web directory  
cd apps/web && pnpm db:generate
```

After creating a migration, copy it to the infra directory for reference:

```bash
cp -r apps/web/prisma/migrations/* infra/migrations/
```

## Environment-Specific Considerations

### Development
- Hot reload enabled with Turbopack
- Environment validation can be skipped with `SKIP_ENV_VALIDATION=1`
- Discord OAuth credentials are optional

### Production
- Set `NODE_ENV=production`
- Generate a secure `AUTH_SECRET`
- Use a managed PostgreSQL service (recommended)
- Set up proper SSL/TLS certificates
- Configure rate limiting and CORS as needed
- Review and set appropriate environment variables

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Ensure PostgreSQL is running
2. Check the `DATABASE_URL` in your `.env` file
3. Verify network connectivity between services

### Build Failures

If the Docker build fails:

1. Check Docker daemon is running
2. Ensure you have sufficient disk space
3. Try clearing Docker build cache: `docker builder prune`

### Port Conflicts

If ports are already in use:

1. Check running services: `docker ps`
2. Modify port mappings in `docker-compose.yml`
3. Update `DATABASE_URL` and other URLs accordingly

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [T3 Stack Documentation](https://create.t3.gg/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
