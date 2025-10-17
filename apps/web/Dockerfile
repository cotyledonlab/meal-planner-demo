# syntax=docker/dockerfile:1

# Base stage with Node.js
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl netcat-openbsd

WORKDIR /app

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy all package.json files for workspace dependencies
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/constants/package.json ./packages/constants/

# Copy prisma schema (needed for postinstall prisma generate)
COPY apps/web/prisma ./apps/web/prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy shared packages
COPY packages ./packages

# Copy web app
COPY apps/web ./apps/web

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

# Generate Prisma Client
RUN cd apps/web && pnpm prisma generate

# Build the application
RUN cd apps/web && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies for migrations
RUN apk add --no-cache netcat-openbsd

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install pnpm for migrations
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate

# Copy public assets
COPY --from=builder /app/apps/web/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

# Copy Prisma files for migrations
COPY --from=builder /app/apps/web/prisma ./prisma
COPY --from=builder /app/apps/web/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/apps/web/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/apps/web/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/apps/web/package.json ./package.json

# Copy migration script
COPY infra/postgres/migrate.sh ./migrate.sh
RUN chmod +x ./migrate.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use migration script as entrypoint
CMD ["sh", "-c", "./migrate.sh node server.js"]
