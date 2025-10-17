# Infrastructure Overview

This directory contains infrastructure configuration for the Meal Planner Demo application.

## Directory Structure

```
infra/
├── postgres/           # PostgreSQL configuration
│   ├── migrate.sh      # Automatic migration script for container startup
│   └── README.md       # PostgreSQL infrastructure documentation
└── migrations/         # Migration history (reference copy from apps/web/prisma/migrations)
    └── README.md       # Migration documentation
```

## Components

### PostgreSQL Database

The application uses PostgreSQL 15 as its primary database. Configuration includes:

- **Docker Image**: `postgres:15-alpine`
- **Default Credentials** (local dev):
  - User: `postgres`
  - Password: `password`
  - Database: `meal-planner-demo`
- **Port**: 5432
- **Data Persistence**: Docker volume `postgres-data`

### Migration System

Migrations are managed by Prisma and automatically applied on container startup:

1. **Primary Location**: `apps/web/prisma/migrations/` - Source of truth
2. **Reference Copy**: `infra/migrations/` - For documentation and history
3. **Automation**: `infra/postgres/migrate.sh` - Runs on web container startup

### Deployment Modes

#### Local Development
```bash
# Start database only
docker compose up -d postgres

# Or use convenience script
./start-database.sh
```

#### Full Stack (Docker Compose)
```bash
# Start all services including database
docker compose up --build
```

#### Production (Dokploy)
- Database provisioned as managed service
- Migrations run automatically on web app startup
- Connection via `DATABASE_URL` environment variable

## Configuration

### Environment Variables

**Development:**
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/meal-planner-demo
```

**Production/Dokploy:**
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

### Health Checks

PostgreSQL service includes health checks:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 5s
  timeout: 5s
  retries: 5
```

Web application waits for healthy database before starting.

## Migration Management

### Viewing Current Schema

```bash
# Open Prisma Studio
pnpm db:studio

# Or from apps/web
cd apps/web && pnpm db:studio
```

### Creating Migrations

```bash
# After modifying prisma/schema.prisma
pnpm db:generate

# Copy to reference location
cp -r apps/web/prisma/migrations/* infra/migrations/
```

### Applying Migrations

**Automatic (Docker/Dokploy):**
- Happens on container startup via `migrate.sh`

**Manual (Local):**
```bash
pnpm db:migrate
```

## Backup and Recovery

### Docker Compose Backups

```bash
# Backup database
docker compose exec postgres pg_dump -U postgres meal-planner-demo > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres meal-planner-demo < backup.sql
```

### Dokploy Backups

Use Dokploy's built-in backup features or database-specific tools provided by your hosting platform.

## Troubleshooting

### Connection Issues

**Check database is running:**
```bash
docker compose ps postgres
```

**Check database logs:**
```bash
docker compose logs postgres
```

**Test connection:**
```bash
docker compose exec postgres psql -U postgres -d meal-planner-demo -c "SELECT version();"
```

### Migration Issues

**Check migration status:**
```bash
cd apps/web && pnpm prisma migrate status
```

**Reset database (development only):**
```bash
cd apps/web && pnpm prisma migrate reset
```

### Port Conflicts

If port 5432 is already in use:
```bash
# Find process using port
lsof -i :5432

# Or modify docker-compose.yml port mapping
ports:
  - '5433:5432'  # Map to different host port
```

## Security Considerations

- **Never commit database passwords** to version control
- Use strong passwords in production
- Restrict database access to application network only
- Enable SSL/TLS for production database connections
- Regular automated backups
- Monitor database logs for suspicious activity

## Performance Optimization

- Connection pooling configured in Prisma (see `apps/web/prisma/schema.prisma`)
- Database indexes defined in schema
- Consider read replicas for high-traffic deployments
- Monitor query performance with Prisma logging
