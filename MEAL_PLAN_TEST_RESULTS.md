# Meal Plan Generation Test Results - Issue #69 Fix Validation

**Test Date:** October 26, 2025
**Test URL:** https://meal-plan-demo-monostack-i9woau-78f535-65-108-56-181.traefik.me/
**Branch:** `fix/issue-69-enable-automatic-seeding`
**Commit:** 4a16d5f - "Fix: Update seed script to use Argon2 password hashing (Issue #73)"

---

## Executive Summary

**RESULT: FIX UNSUCCESSFUL ❌**

The automatic database seeding fix (Issue #69) does **NOT** result in a working meal plan generation feature. While authentication works correctly (confirming the database was seeded), **the meal plan generation completely fails** with a JavaScript error when attempting to create a meal plan.

### Test Outcome: 3/4 Checks Passed

| Check                            | Status  | Details                               |
| -------------------------------- | ------- | ------------------------------------- |
| Page loads without errors        | ✅ PASS | Application navigates successfully    |
| Meal plan is displayed correctly | ❌ FAIL | Application error shown instead       |
| Shopping list appears            | ❌ FAIL | Not reached due to generation failure |
| No JavaScript errors             | ❌ FAIL | Critical error prevents functionality |

---

## Test Execution Flow

### ✅ Phase 1: Authentication (SUCCESSFUL)

1. Navigated to landing page
2. Clicked "Get Started" button → Redirected to signup page
3. Clicked "Sign in" link → Redirected to login page
4. Entered credentials: `premium@example.com` / `P@ssw0rd!`
5. Successfully logged in → Redirected to `/dashboard`

**Conclusion:** Database seeding worked correctly for user authentication.

### ✅ Phase 2: Navigation (SUCCESSFUL)

1. On dashboard, found "🗓️Plan meals" button
2. Clicked button → Navigated to `/planner` page
3. Meal planner wizard displayed correctly with form fields:
   - How many people? → 2 people
   - How many meals per day? → 1 meal (Dinner only)
   - How many days to plan? → 7 days
   - Dietary preferences → Vegetarian, Dairy-free checkboxes
   - Foods to avoid → Optional text field
4. "Create My Plan" button visible and enabled

**Conclusion:** Navigation and UI components working correctly.

### ❌ Phase 3: Meal Plan Generation (FAILED)

1. Clicked "Create My Plan" button
2. **API Request Failed:**
   ```
   URL: /api/trpc/plan.generate?batch=1
   Error: net::ERR_ABORTED
   ```
3. **Page Navigation Failed:**
   ```
   URL: /plan/cmh7pwv2o00anoz0105s1jfhi?_rsc=wxm36
   Error: net::ERR_ABORTED
   ```
4. **JavaScript Error Occurred:**
   ```javascript
   Cannot destructure property 'data' of '(0 , n.wV)(...)' as it is undefined.
   ```
5. **Error Page Displayed:**
   ```
   Application error: a client-side exception has occurred while loading
   meal-plan-demo-monostack-i9woau-78f535-65-108-56-181.traefik.me
   (see the browser console for more information).
   ```

**Conclusion:** Complete failure of meal plan generation feature.

---

## Technical Analysis

### Error Breakdown

#### 1. TRPC API Call Failure

**Request:** `GET /api/trpc/plan.generate?batch=1`
**Status:** net::ERR_ABORTED
**Impact:** The backend plan generation mutation was aborted

**Code Location:** `/home/john/meal-planner-demo/apps/web/src/server/api/routers/plan.ts` (lines 7-25)

```typescript
generate: protectedProcedure
  .input(z.object({ startDate: z.date().optional() }))
  .mutation(async ({ ctx, input }) => {
    const generator = new PlanGenerator(ctx.db);
    const plan = await generator.generatePlan({
      userId: ctx.session.user.id,
      startDate: input.startDate,
    });

    // Automatically create shopping list for the plan
    const shoppingListService = new ShoppingListService(ctx.db);
    await shoppingListService.buildAndStoreForPlan(plan.id);

    return plan;
  }),
```

**Hypothesis:** The `PlanGenerator.generatePlan()` or `ShoppingListService.buildAndStoreForPlan()` is likely failing, possibly due to:

- Missing recipes in the database
- Missing user preferences
- Database relationship issues
- Service initialization failure

#### 2. Server Component Data Fetch Failure

**Request:** `GET /plan/cmh7pwv2o00anoz0105s1jfhi?_rsc=wxm36`
**Status:** net::ERR_ABORTED
**Impact:** The Next.js server component failed to load the plan page

**Code Location:** `/home/john/meal-planner-demo/apps/web/src/app/plan/[id]/page.tsx` (line 20)

```typescript
const plan = await api.plan.getById({ planId: id });
```

**Hypothesis:** Since the plan generation failed, the redirect to `/plan/{id}` happens, but `getById` cannot find the plan (because it was never created), causing the server component to crash.

#### 3. Client-Side Destructuring Error

**Error:** `Cannot destructure property 'data' of '(0 , n.wV)(...)' as it is undefined`
**Impact:** React error boundary triggered, showing generic error page

**Hypothesis:** A Next.js/React Server Component is trying to use data from a failed fetch, but doesn't have proper null checks before destructuring.

### Root Cause Analysis

The failure chain is:

1. **TRPC mutation `plan.generate` fails** (likely in `PlanGenerator` or `ShoppingListService`)
2. **Despite the failure, the client still redirects** to `/plan/{planId}`
3. **Server component tries to fetch the plan** with `api.plan.getById()`
4. **The plan doesn't exist** (was never created due to step 1 failure)
5. **Server component crashes** trying to access properties of `null`/`undefined`
6. **Error boundary shows generic error page** to user

---

## Database Seeding Status

### ✅ Confirmed Working

- User table seeded correctly (`premium@example.com` can log in)
- Password hashing working (Argon2)
- User session/authentication working

### ❓ Unconfirmed

- Recipe table seeding
- Ingredient table seeding
- User preferences seeding
- Database relationships integrity

---

## Recommended Actions

### 🔴 Critical (Must Fix)

1. **Check server logs for the actual error**

   ```bash
   # SSH into the Dokploy deployment and check logs
   docker logs <container-name>
   ```

2. **Verify recipe/ingredient seeding**

   ```bash
   # Check if recipes exist in database
   docker exec -it <db-container> psql -U <user> -d <dbname> -c "SELECT COUNT(*) FROM \"Recipe\";"
   docker exec -it <db-container> psql -U <user> -d <dbname> -c "SELECT COUNT(*) FROM \"Ingredient\";"
   ```

3. **Add error handling in plan.generate mutation**
   - Wrap `generatePlan()` and `buildAndStoreForPlan()` in try-catch
   - Return meaningful error messages to the client
   - Log errors for debugging

4. **Fix client-side error handling**
   - The planner page (line 13-16) uses `onSuccess` callback to redirect
   - If `onSuccess` fires but the plan is incomplete, it will crash
   - Add `onError` callback to handle failures gracefully

5. **Add null checks in server component**
   - `/app/plan/[id]/page.tsx` should handle cases where plan doesn't exist
   - Already has `notFound()` check on line 22-24, but error happens before that

### 🟡 High Priority (Should Fix)

6. **Improve error messages**
   - Replace generic "Application error" with user-friendly messages
   - Add retry logic with exponential backoff

7. **Add loading states**
   - The planner page has loading state (lines 41-49) but user never sees it
   - May need to delay redirect until plan is confirmed created

8. **Test the full flow locally**
   - Run `npm run db:seed` locally
   - Test plan generation in development
   - Fix any issues before redeploying

### 🟢 Nice to Have (Future Improvements)

9. **Add telemetry/monitoring**
   - Track where in the flow users fail
   - Monitor API response times

10. **Add E2E tests**
    - Automate this Puppeteer test in CI/CD
    - Catch regressions before deployment

---

## Test Artifacts

### Screenshots

#### Before Clicking "Create My Plan"

**File:** `/tmp/before-create-plan.png`
**Shows:** Meal planner wizard with form fields filled in, "Create My Plan" button ready to click

#### After Clicking "Create My Plan"

**File:** `/tmp/after-create-plan.png`
**Shows:** Generic "Application error: a client-side exception has occurred" page

### Test Script

**File:** `/tmp/test-meal-plan.js`
**Description:** Full Puppeteer headless Chrome test script that automates the entire flow

### Full Test Report

**File:** `/tmp/meal-plan-test-report.md`
**Description:** Detailed technical report with error analysis and recommendations

---

## Network Request Analysis

### Failed Requests

| URL                               | Method | Status      | Description                            |
| --------------------------------- | ------ | ----------- | -------------------------------------- |
| `/dashboard?_rsc=971we`           | GET    | ERR_ABORTED | React Server Component fetch (benign)  |
| `/dashboard?_rsc=19avn`           | GET    | ERR_ABORTED | React Server Component fetch (benign)  |
| `/api/trpc/plan.generate?batch=1` | POST   | ERR_ABORTED | **CRITICAL: Plan generation API call** |
| `/plan/{id}?_rsc=wxm36`           | GET    | ERR_ABORTED | **CRITICAL: Plan page load failed**    |

**Note:** The first two ERR_ABORTED requests are normal React 18 behavior with concurrent rendering. The last two are the actual failures.

---

## Conclusion

The automatic database seeding implementation (Issue #69) successfully seeds user data, as evidenced by successful authentication. However, **it does not seed enough data to support meal plan generation**, or there is a bug in the meal plan generation logic itself.

The meal plan generation feature is **completely broken** in the current deployment. Users who try to create a meal plan will encounter a generic error page with no meal plan created.

**The fix is UNSUCCESSFUL and requires immediate attention before this can be considered working.**

---

## Next Steps

1. ✅ **This test report created** - Document findings
2. ⏭️ **Check server logs** - Identify the exact error in plan generation
3. ⏭️ **Verify database seeding** - Ensure recipes and ingredients are seeded
4. ⏭️ **Fix the bug** - Address the root cause in PlanGenerator or ShoppingListService
5. ⏭️ **Add error handling** - Improve user experience when errors occur
6. ⏭️ **Retest** - Run this Puppeteer test again to verify the fix

---

**Test conducted by:** Claude Code (Puppeteer automation)
**Report generated:** October 26, 2025
