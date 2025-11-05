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

1. PostgreSQL, Redis, and Mailpit services start and become healthy
2. A dedicated `migrate` service runs `pnpm prisma migrate deploy` against Postgres
   - Built from the dependencies stage where Prisma CLI is available
   - Exits successfully after applying pending migrations
3. The `web` service builds using the monorepo Dockerfile (`apps/web/Dockerfile`)
   - Installs workspace dependencies in a separate deps stage
   - Copies shared packages (types, constants)
   - Generates Prisma client
   - Builds the Next.js application (standalone output)
4. The `web` container starts only after Postgres is healthy and `migrate` completes
   - Next.js serves on container port 3000; mapped to host `${WEB_PORT:-3000}`
   - A container healthcheck verifies the app responds on `/`

Services will be available at:

- **Application**: `http://localhost:${WEB_PORT:-3000}`
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Mailpit Web UI**: `http://localhost:8025`

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

1. **Start backing services** (PostgreSQL required; Mailpit optional for local email testing):

```bash
docker compose up -d postgres
```

Need Mailpit locally? Run the combined stack:

```bash
pnpm docker:dev
```

Or use the provided script for a standalone Postgres container:

```bash
./start-database.sh
```

1. **Set up environment variables**:

```bash
cp .env.example .env
cp .env apps/web/.env
# Edit both .env files with your configuration
```

1. **Set up the database**:

```bash
pnpm db:push
```

1. **Start the development server**:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Option 3: Production Build (Local)

1. Follow steps 1-4 from "Local Development"

2. **Build the application**:

```bash
pnpm build
```

1. **Start the production server**:

```bash
pnpm start
```

## Docker Build Notes

The repository includes a Dockerfile at the root level (`Dockerfile`) and in the web app directory (`apps/web/Dockerfile`). Both files are functionally equivalent and designed to work from the repository root context, providing flexibility for different deployment scenarios:

- **Root-level Dockerfile**: Use for simplified deployments where the platform automatically looks for `Dockerfile` in the repository root
- **apps/web/Dockerfile**: Use when explicitly configuring the Dockerfile path in deployment platforms like Dokploy

The Dockerfile uses a multi-stage build process optimized for the monorepo structure:

1. **Base stage**: Sets up Node.js 20 Alpine
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
   - Does not include Prisma CLI (migrations run in the dedicated `migrate` service)
   - Starts Next.js via `node apps/web/server.js`

The build uses Next.js standalone output for minimal image size while maintaining the ability to run database migrations.

## Dokploy Deployment

[Dokploy](https://dokploy.com/) is a self-hosted Platform-as-a-Service that simplifies deployment of containerized applications.

### Dokploy prerequisites

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

   # Mailersend SMTP (required for password reset emails)
   SMTP_HOST=smtp.mailersend.net
   SMTP_PORT=587
   SMTP_USER=<mailersend-smtp-username>
   SMTP_PASS=<mailersend-smtp-password>
   SMTP_FROM="MealMind AI <noreply@your-domain.com>"

   # Optional OAuth
   AUTH_DISCORD_ID=<your-discord-client-id>
   AUTH_DISCORD_SECRET=<your-discord-client-secret>
   ```

3. **Use the existing docker-compose.yml**
   - Dokploy will automatically use the `docker-compose.yml` at the repository root
   - This includes postgres, mailpit (if `pnpm docker:dev` is used), `migrate`, and web services
   - Migrations run automatically in the dedicated `migrate` service before web starts
   - Host-port bindings are configurable via environment variables to avoid conflicts on shared hosts:
     - `WEB_PORT` (default 3000)
     - `POSTGRES_PORT` (default 5432)
     - `MAILPIT_WEB_PORT` (default 8025)
     - `MAILPIT_SMTP_PORT` (default 1025)

4. **Deploy**
   - Click "Deploy" in Dokploy dashboard
   - Monitor build logs for any errors
   - Once deployed, access your app at the configured domain
   - Perform a password reset in production to confirm the email reaches your inbox

#### Option 2: Separate App and Database

Deploy web app and database as separate Dokploy applications:

1. **Create PostgreSQL Database in Dokploy**
   - Create a new Postgres service
   - Note the connection URL
   - Configure persistence volume for data retention

2. **Create Web Application**
   - Create new Docker application in Dokploy
   - Repository: `https://github.com/cotyledonlab/meal-planner-demo`
   - Dockerfile path: `Dockerfile` (root level) or `apps/web/Dockerfile`
   - Build context: Repository root (`.`)

3. **Configure Environment Variables**:

   ```bash
   AUTH_SECRET=<generate-with-npx-auth-secret>
   DATABASE_URL=<postgres-connection-url-from-dokploy>
   NEXTAUTH_URL=https://your-domain.com
   NODE_ENV=production
   SKIP_ENV_VALIDATION=1
   SMTP_HOST=smtp.mailersend.net
   SMTP_PORT=587
   SMTP_USER=<mailersend-smtp-username>
   SMTP_PASS=<mailersend-smtp-password>
   SMTP_FROM="MealMind AI <noreply@your-domain.com>"
   ```

4. **Configure Port Mapping**
   - Container port: `3000`
   - Host port: Choose a port not already in use on the Dokploy host (e.g., `3008`), or rely on Dokploy's reverse proxy with domain routing. When using the provided docker-compose, set `WEB_PORT` in environment to override the default 3000.

5. **Deploy**
   - Click "Deploy"
   - The `migrate` job will apply migrations, then `web` will start

### Database Migrations on Dokploy

Migrations are handled automatically by the `migrate` service in docker-compose:

- It waits for the `postgres` service to be healthy
- Runs `pnpm prisma migrate deploy` from the web workspace
- Exits successfully once all migrations are applied

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
SMTP_HOST=mailpit
SMTP_PORT=1025
```

#### Production

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/meal-planner-prod
NEXTAUTH_URL=https://your-domain.com
# Ensure AUTH_SECRET is cryptographically secure
SMTP_HOST=smtp.mailersend.net
SMTP_PORT=587
SMTP_USER=<mailersend-smtp-username>
SMTP_PASS=<mailersend-smtp-password>
SMTP_FROM="MealMind AI <noreply@your-domain.com>"
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
- Verify Dockerfile path is correct (`Dockerfile` at root or `apps/web/Dockerfile`)
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

**Port binding error: Bind for 0.0.0.0:3000 failed: port is already allocated**

This indicates the Dokploy host already has a service bound to port 3000. Fix:

1. In the Dokploy app environment, set `WEB_PORT` to an unused port (for example, `3008`).
2. Redeploy the stack so the web container binds to the new host port.
3. Ensure `NEXTAUTH_URL` is set to your public domain (e.g., `https://app.example.com`). The reverse proxy will route traffic regardless of the host port.

Tip: If your Dokploy setup does not require a host port (because ingress handles routing), you can set `WEB_PORT=0` to allow Docker to choose an ephemeral port and avoid conflicts entirely.

**Warning: The "AUTH_SECRET" variable is not set. Defaulting to a blank string.**

Set a strong `AUTH_SECRET` in the Dokploy environment variables. Generate one with:

```bash
npx auth secret
```

Save the value in Dokploy and redeploy. In production, `AUTH_SECRET` is required and must not be empty.

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

## Custom Domain with HTTPS and Subdirectory Path

This section covers deploying the application with a custom domain and serving it from a subdirectory path (e.g., `https://cotyledonlab.com/demos/meal-planner`) using Dokploy's built-in Traefik reverse proxy.

### Prerequisites

- A domain name (e.g., `cotyledonlab.com`)
- Access to your domain's DNS settings
- Dokploy server with a public IP address
- Ports 80 and 443 open on your server (Dokploy's Traefik uses these)

### Architecture

Dokploy includes a built-in Traefik instance that handles:

- HTTP to HTTPS redirects
- Automatic Let's Encrypt SSL certificates
- Reverse proxy routing to your applications

```
Internet → Dokploy's Traefik (ports 80/443) → Path-based routing → Your App (port 3000)
          ↓
       Let's Encrypt (automatic SSL)
```

### Step 1: Configure DNS

1. **Add A Record for your domain:**
   - Log in to your domain registrar's DNS management panel
   - Add an A record:
     - **Host/Name**: `@` (or leave blank for root domain)
     - **Type**: `A`
     - **Value**: Your Dokploy server's public IP address
     - **TTL**: 3600 (or auto)

2. **Optional: Add WWW subdomain:**
   - **Host/Name**: `www`
   - **Type**: `CNAME` or `A`
   - **Value**: `cotyledonlab.com` (or your server IP)
   - **TTL**: 3600

3. **Wait for DNS propagation:**
   - DNS changes can take 15-60 minutes to propagate
   - Test with: `dig cotyledonlab.com` or `nslookup cotyledonlab.com`
   - Verify the IP address matches your Dokploy server

**Finding your Dokploy server IP:**

```bash
# SSH into your Dokploy server
curl ifconfig.me
```

### Step 2: Configure Environment Variables

Set these in your Dokploy application environment settings:

```bash
# Base path for subdirectory deployment
BASE_PATH=/demos/meal-planner

# NextAuth URL must include the full path with basePath
NEXTAUTH_URL=https://cotyledonlab.com/demos/meal-planner

# Your custom domain (optional, for reference)
DOMAIN=cotyledonlab.com

# Required authentication and database variables
AUTH_SECRET=<generate-with-npx-auth-secret>
POSTGRES_PASSWORD=<secure-password>
NODE_ENV=production
```

**Important:** The `NEXTAUTH_URL` must include the full path including the subdirectory.

### Step 3: Configure Dokploy Domain and Path

In the Dokploy dashboard for your application:

1. **Navigate to your Compose application** (`meal-planner-demo`)

2. **Go to the "Domains" section**

3. **Add a domain:**
   - **Domain**: `cotyledonlab.com`
   - **Path**: `/demos/meal-planner`
   - **Service Name**: `web` (the service name from docker-compose.yml)
   - **Container Port**: `3000`
   - **HTTPS**: Enable
   - **Generate SSL Certificate**: Enable (Let's Encrypt)

4. **Save the configuration**

Dokploy's Traefik will automatically:

- Route traffic from `https://cotyledonlab.com/demos/meal-planner` to your web container
- Request and manage SSL certificates via Let's Encrypt
- Redirect HTTP to HTTPS

### Step 4: Deploy

1. **Deploy or redeploy your application** in Dokploy
2. **Monitor deployment logs** for any errors
3. **Wait 1-2 minutes** for SSL certificate generation

### Step 5: Verify

1. **Check SSL certificate:**
   - Visit `https://cotyledonlab.com/demos/meal-planner`
   - Verify no browser security warnings
   - Check certificate is issued by Let's Encrypt

2. **Test HTTP redirect:**
   - Visit `http://cotyledonlab.com/demos/meal-planner`
   - Should automatically redirect to HTTPS

3. **Test authentication:**
   - Sign in and verify the authentication flow works correctly

### Subdirectory Path Configuration

The application is configured to be served from a subdirectory path. This requires coordination between:

1. **Next.js basePath** (`apps/web/next.config.js`):
   - Automatically prefixes all routes, assets, and API endpoints
   - Set via `BASE_PATH` environment variable
   - Default: `/demos/meal-planner`

2. **Dokploy domain configuration**:
   - Path field: `/demos/meal-planner`
   - Dokploy's Traefik routes requests with this path prefix to your container

3. **NextAuth configuration**:
   - `NEXTAUTH_URL` must include the full path: `https://cotyledonlab.com/demos/meal-planner`
   - This ensures OAuth callbacks and redirects work correctly

**All three must match for the application to work correctly.**

### Deploying at Root Path

If you prefer to deploy at the root path instead of a subdirectory:

1. **Update environment variables:**

   ```bash
   BASE_PATH=""
   NEXTAUTH_URL=https://cotyledonlab.com
   ```

2. **Update Dokploy domain configuration:**
   - Domain: `cotyledonlab.com`
   - Path: `/` (or leave empty)
   - Service: `web`
   - Port: `3000`

### Multiple Applications on Same Domain

Dokploy's Traefik supports hosting multiple applications on the same domain using different paths:

**Example configuration in Dokploy:**

- **App 1** (meal-planner): `cotyledonlab.com/demos/meal-planner` → web service
- **App 2** (other app): `cotyledonlab.com/demos/other-app` → other-web service
- **Main site**: `cotyledonlab.com/` → main-site service

Traefik automatically prioritizes more specific paths over less specific ones.

### Troubleshooting

#### SSL Certificate Issues

**Certificate not obtained:**

- Verify DNS points to your Dokploy server: `dig cotyledonlab.com`
- Ensure ports 80 and 443 are open in firewall
- Check Dokploy application logs for certificate errors
- Verify domain is correctly configured in Dokploy

**Browser shows "Not Secure":**

- Wait a few minutes for Let's Encrypt certificate generation
- Check Dokploy's Traefik logs: `docker logs traefik` (if accessible)
- Verify domain in browser matches domain configured in Dokploy

#### Application Not Loading

**404 Not Found:**

- Verify the path configuration matches in all three places (BASE_PATH, NEXTAUTH_URL, Dokploy path)
- Check that the web service is running: view application logs in Dokploy
- Ensure container port is set to `3000` in Dokploy domain config

**Authentication Redirect Loop:**

- Verify `NEXTAUTH_URL` exactly matches the full URL including path
- Check that `BASE_PATH` is set correctly
- Review NextAuth logs in application logs

**Routes Return 404 or Assets Don't Load:**

- Verify `BASE_PATH` environment variable is set and matches Dokploy path
- Check Next.js build logs for basePath configuration
- Ensure the application rebuilt after changing `BASE_PATH`

#### Port Conflicts

If you see "port already allocated" errors:

- Don't try to expose ports 80 or 443 in docker-compose.yml
- Dokploy's Traefik already uses these ports
- Only expose application-specific ports (like 3000 for the web service)
- Set `WEB_PORT` to a unique value if needed, or don't expose it at all (let Dokploy's Traefik handle routing)

### Production Checklist

- [ ] DNS A record points to Dokploy server IP
- [ ] DNS has propagated (verify with dig/nslookup)
- [ ] `BASE_PATH=/demos/meal-planner` set in environment
- [ ] `NEXTAUTH_URL=https://cotyledonlab.com/demos/meal-planner` set in environment
- [ ] `DOMAIN=cotyledonlab.com` set in environment (optional)
- [ ] `AUTH_SECRET` is securely generated
- [ ] Domain configured in Dokploy with correct path
- [ ] SSL certificate enabled in Dokploy domain settings
- [ ] Application deployed successfully
- [ ] HTTPS works without browser warnings
- [ ] HTTP redirects to HTTPS
- [ ] Authentication flow works correctly
- [ ] All routes and assets load correctly

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

### Development Notes

- Hot reload enabled with Turbopack
- Environment validation can be skipped with `SKIP_ENV_VALIDATION=1`
- Discord OAuth credentials are optional

### Production Notes

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
4. **Connection Pool Configuration**: Add connection pool parameters to DATABASE_URL:
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=30&connect_timeout=30"
   ```
5. **PostgreSQL Timeouts**: Set appropriate timeout values in PostgreSQL configuration:
   - `statement_timeout = 30000` (30 seconds)
   - `idle_in_transaction_session_timeout = 60000` (1 minute)
6. **Connection Retry**: The application automatically handles graceful shutdowns and connection cleanup

### Database Security Best Practices

**CRITICAL**: Always secure your database in production:

1. **Never expose PostgreSQL port publicly**:
   - The docker-compose.yml now has PostgreSQL ports commented out by default
   - Only expose ports for local development when necessary
   - In production (Dokploy), services communicate via Docker internal network

2. **Firewall Configuration**:
   - Ensure PostgreSQL port (5432) is NOT accessible from the public internet
   - Configure firewall rules to only allow connections from application containers
   - Use Dokploy's internal network for service-to-service communication

3. **Authentication**:
   - Use strong passwords for PostgreSQL users
   - Never use default passwords in production
   - Store credentials securely using environment secrets

4. **Connection Encryption**:
   - Enable SSL/TLS for database connections in production
   - Add `?sslmode=require` to DATABASE_URL for encrypted connections
   - Example: `postgresql://user:pass@host:5432/db?sslmode=require&connection_limit=10`

5. **Monitor for Attacks**:
   - Review PostgreSQL logs regularly for suspicious activity
   - Set up alerts for failed authentication attempts
   - Monitor for SQL injection attempts in application logs

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
