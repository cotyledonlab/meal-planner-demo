# Deployment Guide

This document provides instructions for deploying the Meal Planner Demo application.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and pnpm 9+ (for local development)
- PostgreSQL database (local or managed service)

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Authentication
AUTH_SECRET=your-generated-secret  # Generate with: npx auth secret
AUTH_DISCORD_ID=                   # Optional: Discord OAuth client ID
AUTH_DISCORD_SECRET=               # Optional: Discord OAuth client secret

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/meal-planner-demo

# Node Environment
NODE_ENV=production
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

Deploy the complete stack (PostgreSQL, Redis, Mailpit, and the web application):

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode
docker compose up -d --build
```

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

1. **Start backing services** (PostgreSQL, Redis, Mailpit):

```bash
docker compose up -d postgres redis mailpit
```

Or use the provided script:

```bash
./start-database.sh
```

2. **Install dependencies**:

```bash
pnpm install
```

3. **Set up the database**:

```bash
pnpm db:push
```

4. **Start the development server**:

```bash
pnpm dev
```

The application will be available at http://localhost:3000.

### Option 3: Production Build (Local)

1. Follow steps 1-3 from "Local Development"

2. **Build the application**:

```bash
pnpm build
```

3. **Start the production server**:

```bash
pnpm start
```

## Docker Build Notes

The Dockerfile uses a multi-stage build process:

1. **Base stage**: Sets up Node.js 20 Alpine
2. **Dependencies stage**: Installs project dependencies
3. **Builder stage**: Generates Prisma client and builds the Next.js app
4. **Runner stage**: Creates optimized production image

The build uses Next.js standalone output for minimal image size.

## Database Migrations

When deploying to production, ensure you run database migrations:

```bash
# Using Prisma
pnpm db:migrate

# Or if using Docker Compose, exec into the web container
docker compose exec web pnpm db:migrate
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
