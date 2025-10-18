# Email Authentication Guide

This document describes the email authentication system implemented in the meal planner application.

## Overview

The application uses **NextAuth.js v5** (Auth.js) with email/password authentication, secured with **argon2id** password hashing.

## Features

- ✅ Email + password sign-up and login
- ✅ Secure password hashing with argon2id
- ✅ JWT session management
- ✅ Form validation (client and server-side)
- ✅ Protected routes with automatic redirect
- ✅ Session persistence

## Authentication Flow

### Sign Up

1. User navigates to `/auth/signup`
2. Fills in optional name, email, and password
3. Password is validated:
   - Minimum 8 characters
   - Maximum 128 characters
   - At least one uppercase letter
   - At least one number
4. Server hashes password with argon2id
5. User account is created in database
6. User is automatically signed in and redirected to dashboard

### Sign In

1. User navigates to `/auth/signin`
2. Enters email and password
3. Server verifies credentials using argon2id
4. JWT token is created
5. User is redirected to requested page (or dashboard)

### Protected Routes

- Server-side protection using `auth()` from NextAuth
- Unauthenticated users are redirected to `/auth/signin?callbackUrl=<requested-page>`
- After sign-in, users are returned to their original destination

## Database Schema

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  password      Password?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Password Model

```prisma
model Password {
  userId    String   @id
  hash      String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Security Features

### Password Hashing

- Algorithm: **argon2id** (recommended over bcrypt)
- Parameters:
  - Memory cost: 19456 KiB
  - Time cost: 2 iterations
  - Output length: 32 bytes
  - Parallelism: 1

### Session Management

- Strategy: JWT (JSON Web Tokens)
- Tokens are HTTP-only cookies
- Automatic token refresh
- Can be switched to database sessions by changing `session.strategy` in auth config

## API Routes

### POST `/api/auth/signup`

Creates a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "Optional Name"
}
```

**Response (Success):**

```json
{
  "success": true,
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "Optional Name"
  }
}
```

**Response (Error):**

```json
{
  "error": "User already exists"
}
```

### POST `/api/auth/signin`

Handled by NextAuth.js (via Credentials provider)

## Pages

- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/dashboard` - Protected example page

## Environment Variables

```bash
# Required for production, optional for development
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# Database connection
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
# Or for SQLite:
# DATABASE_URL="file:./dev.db"
```

Generate AUTH_SECRET:

```bash
openssl rand -base64 32
```

## Local Development

### Using Docker Compose (Recommended)

```bash
# Start PostgreSQL
docker compose up postgres -d

# Run migrations
pnpm db:generate

# Start dev server
pnpm dev
```

### Using SQLite (Alternative)

1. Update `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:

   ```
   DATABASE_URL="file:./dev.db"
   ```

3. Run migrations:
   ```bash
   pnpm db:push
   ```

## Migration to External Postgres

To migrate from local to production Postgres:

1. Update `DATABASE_URL` in production environment
2. Run migrations:
   ```bash
   pnpm db:migrate
   ```

No code changes needed - the same code works with both local and external Postgres.

## Testing

### Manual Testing

1. Navigate to `http://localhost:3000/auth/signup`
2. Create an account with:
   - Email: `test@example.com`
   - Password: `TestPassword123` (or any password meeting requirements)
3. Verify redirect to dashboard
4. Click "Sign out"
5. Navigate to `http://localhost:3000/auth/signin`
6. Sign in with same credentials
7. Verify access to dashboard

### Database Verification

```bash
# Open Prisma Studio
pnpm db:studio

# View User and Password records
```

## Future Enhancements

Possible additions (not currently implemented):

- Email verification
- Password reset flow
- Magic link authentication
- Social provider login (Discord already configured)
- Two-factor authentication
- Rate limiting on auth endpoints
- Account lockout after failed attempts

## Troubleshooting

### "Invalid email or password" error

- Verify email is correct
- Ensure password meets requirements
- Check database for user existence

### Database connection errors

- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running (`docker compose ps`)
- Check migrations are applied (`pnpm db:generate`)

### Session not persisting

- Clear browser cookies
- Verify AUTH_SECRET is set
- Check browser console for errors

## Related Files

- `/src/server/auth/config.ts` - Auth configuration
- `/src/server/auth/index.ts` - Auth exports
- `/src/app/api/auth/signup/route.ts` - Sign-up API
- `/src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `/src/app/auth/signin/page.tsx` - Sign-in page
- `/src/app/auth/signup/page.tsx` - Sign-up page
- `/src/app/dashboard/page.tsx` - Protected page example
- `/prisma/schema.prisma` - Database schema
