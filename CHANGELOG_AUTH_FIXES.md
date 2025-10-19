# Authentication and Premium Access Fixes

**Date:** 2025-01-19

## Issues Resolved

### 1. Premium Features Disabled for Premium Users

**Problem:** Users with premium role in the database were unable to access premium features. The UI showed premium features as disabled even after logging in with a premium account.

**Root Cause:** The NextAuth session was not including the `role` field from the database. The JWT and session callbacks were not enriched with role information.

**Solution:**

- Updated NextAuth type declarations to include `role` in `Session.user` and `User` interfaces
- Modified JWT callback to include `role` from user object
- Modified session callback to expose `role` on session.user
- Added signIn callback to fetch role from database for OAuth providers
- Modified credentials provider authorize function to return role from database

**Files Changed:**

- `apps/web/src/server/auth/config.ts`

### 2. Name Field Optional in Signup

**Problem:** The signup form marked the name field as optional, but the backend validation required it. This created confusion and inconsistent validation.

**Root Cause:** UI label showed "(optional)" while the Zod schema enforced a minimum length of 1.

**Solution:**

- Removed "(optional)" text from the name field label
- Added `required` attribute to the name input field
- Updated Zod schema to trim whitespace before validation
- Both client and server now consistently require a non-empty name

**Files Changed:**

- `apps/web/src/app/auth/signup/page.tsx`
- `apps/web/src/app/api/auth/signup/route.ts`

### 3. Auth Pages Not Scrollable

**Problem:** Sign in and sign up pages were not properly scrollable on mobile devices or when the keyboard was open, potentially hiding form fields and submit buttons.

**Root Cause:**

- Auth layout used `min-h-screen` but the parent body element didn't have proper height settings
- Right panel didn't have `overflow-y-auto` to allow scrolling

**Solution:**

- Added `h-full` class to both `<html>` and `<body>` elements in root layout
- Changed AuthLayout to use `min-h-full` instead of `min-h-screen`
- Added `overflow-y-auto` to the right panel containing the form

**Files Changed:**

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/auth/_components/AuthLayout.tsx`

## New Features

### Premium Procedure for tRPC

Added a new `premiumProcedure` middleware that automatically enforces premium access:

```typescript
export const premiumProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (ctx.session.user.role !== "premium") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This feature requires a premium subscription",
      });
    }
    return next({
      ctx: { session: { ...ctx.session, user: ctx.session.user } },
    });
  });
```

**Usage:** Replace `protectedProcedure` with `premiumProcedure` for any premium-only endpoints.

**Files Added/Changed:**

- `apps/web/src/server/api/trpc.ts`

### Auth Utility Functions

Created helper functions for checking user roles:

```typescript
export function isPremiumUser(user: UserWithRole | null | undefined): boolean {
  return user?.role === "premium";
}

export function isAuthenticatedUser(
  user: UserWithRole | null | undefined,
): boolean {
  return !!user;
}
```

**Usage:** Import from `~/lib/auth` to check premium status in both client and server components.

**Files Added:**

- `apps/web/src/lib/auth.ts`
- `apps/web/src/lib/auth.test.ts`

### UI Integration Example

Updated `ShoppingList` component to demonstrate premium gating:

```tsx
import { useSession } from "next-auth/react";
import { isPremiumUser } from "~/lib/auth";

function ShoppingList({ items, onComparePrices }: ShoppingListProps) {
  const { data: session, status } = useSession();
  const isPremium = isPremiumUser(session?.user);
  const isLoading = status === "loading";

  return (
    <button disabled={isLoading}>
      {isPremium ? "Compare Prices" : "Compare Prices (Premium Preview)"}
    </button>
  );
}
```

**Files Changed:**

- `apps/web/src/app/_components/ShoppingList.tsx`

## Tests Added

### Unit Tests

1. **Auth utility functions** (`apps/web/src/lib/auth.test.ts`)
   - Tests for `isPremiumUser` with various inputs
   - Tests for `isAuthenticatedUser` with various inputs

2. **Signup schema validation** (`apps/web/src/app/api/auth/signup/route.test.ts`)
   - Name field validation (required, trimmed)
   - Email validation
   - Password validation (length, uppercase, number requirements)

3. **Premium procedure** (`apps/web/src/server/api/trpc.test.ts`)
   - Role verification logic
   - FORBIDDEN error structure

## Migration Notes

### For Existing Users

No database migration is required. The `role` field already exists in the User table with a default value of `"basic"`.

### Upgrading Users to Premium

To upgrade a user to premium access:

```typescript
await db.user.update({
  where: { id: userId },
  data: { role: "premium" },
});
```

**Important:** Users must sign out and sign back in for the session to reflect the new role.

### For OAuth Users

The signIn callback automatically fetches the role from the database for OAuth providers (e.g., Discord), ensuring consistent behavior across authentication methods.

## Testing Checklist

- [x] TypeScript compilation passes (`pnpm typecheck`)
- [x] ESLint passes with no errors (`pnpm lint`)
- [x] All unit tests pass (`pnpm test`)
- [x] Signup requires name field
- [x] Premium users see premium features enabled
- [x] Basic users see premium preview/upsell
- [x] Auth pages are scrollable on mobile viewports

## Rollback Plan

If premium gating causes issues:

1. Temporarily disable premium checks in UI:

   ```typescript
   const isPremium = true; // Force enable for all users
   ```

2. Remove `premiumProcedure` usage and revert to `protectedProcedure`

3. The session changes are backward compatible - sessions without role will still work

## Documentation Updates

- Updated `docs/AUTH.md` with:
  - Premium access control section
  - Examples of checking premium status
  - Instructions for upgrading users
  - Updated signup flow to reflect required name field

## Related Issues

- Premium login features disabled: ✅ Fixed
- Name field marked optional: ✅ Fixed
- Auth pages not scrollable: ✅ Fixed
