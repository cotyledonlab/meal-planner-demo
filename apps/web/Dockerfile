# syntax=docker/dockerfile:1

# Define pnpm version for consistency across all stages
ARG PNPM_VERSION=9.10.0

# Base stage with Node.js
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy all package.json files for workspace dependencies
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/constants/package.json ./packages/constants/

# Copy prisma schema (needed for postinstall prisma generate)
COPY apps/web/prisma ./apps/web/prisma

# Copy migration helper script for runtime containers
COPY infra/postgres/migrate.sh ./infra/postgres/migrate.sh
RUN chmod +x ./infra/postgres/migrate.sh

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache git
WORKDIR /app

# Accept BASE_PATH as a build argument for Next.js to inline NEXT_PUBLIC_ vars
ARG BASE_PATH=/demos/meal-planner
ARG NEXT_PUBLIC_BASE_PATH=/demos/meal-planner

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Cache invalidation: Extract git branch name to invalidate cache on branch switch
# This runs after dependency installation (preserving dep cache) but before source copy
COPY .git ./.git
ARG GIT_BRANCH
RUN git rev-parse --abbrev-ref HEAD > /tmp/branch && \
    echo "Building branch: $(cat /tmp/branch)" && \
    rm -rf .git

# Copy shared packages
COPY packages ./packages

# Copy web app
COPY apps/web ./apps/web

# Copy infra directory for migration stage
COPY infra ./infra

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1
# Dummy DATABASE_URL for build time (real URL provided at runtime)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
# Pass BASE_PATH to the build so Next.js can inline it in NEXT_PUBLIC_BASE_PATH
ENV BASE_PATH=${BASE_PATH}
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}

# Generate Prisma Client
RUN cd apps/web && pnpm prisma generate

# Build the application
RUN cd apps/web && pnpm build

# Database migration stage - optimized for running migrations and seeding
FROM base AS migration
WORKDIR /app

# Copy workspace configuration and lock files needed by pnpm
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Copy workspace directories (required by pnpm workspace resolution)
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps

# Copy optimized node_modules from builder stage (production dependencies only)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules

# Copy infrastructure scripts needed for migrations
COPY --from=builder /app/infra ./infra

# Install pnpm for running migration scripts
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# No specific entrypoint - will use command from docker-compose
# The migrate.sh script expects DATABASE_URL to be set at runtime

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

## No package manager needed at runtime

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Copy application public assets and static chunks relative to server directory
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy Prisma files for migrations and full node_modules for CLI availability
COPY --from=builder /app/apps/web/prisma ./prisma
# Standalone output contains runtime deps already

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
