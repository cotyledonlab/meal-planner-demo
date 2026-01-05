# Bugs Found During Exploratory Testing

This file tracks bugs discovered during automated exploratory testing.

## Critical (Blocking)

### BUG-012: Premium Features Not Enforced at API Level (Tier Access Bypass)

- **Test**: TIER-001
- **Location**:
  - `apps/web/src/server/api/trpc.ts` (lines 146-162) - premiumProcedure defined but never used
  - `apps/web/src/server/api/routers/shoppingList.ts` (lines 150-178) - Returns price data to all users
- **Description**: The `premiumProcedure` middleware is defined but never imported or used by any router. All premium feature protection is done only on the frontend via `isPremiumUser()` checks. This means authenticated users can bypass premium restrictions by calling the tRPC API directly.
- **Expected Behavior**: Premium features should be protected at the API level. The `premiumProcedure` middleware should be used for endpoints that return premium-only data.
- **Actual Behavior**:
  1. `shoppingList.getForMealPlan` returns `storePrices` (price comparison data) to ALL authenticated users
  2. The frontend hides this data from free users, but the data is still returned and accessible
  3. No router imports or uses `premiumProcedure` despite it being defined
- **Impact**: **HIGH SEVERITY / BUSINESS IMPACT**
  - Free users can access premium price comparison data via direct API calls
  - Premium subscription value is undermined
  - Revenue impact if users realize they don't need to upgrade
- **Evidence**:
  ```bash
  grep -r "premiumProcedure" apps/web/src/server/api/routers/
  # Returns: No matches found
  ```
- **What Works**:
  - Meal plan days restriction IS enforced server-side in PlanGenerator (lines 84-92)
  - This is the ONLY server-side premium check
- **Recommendation**:
  1. **Option A**: Use `premiumProcedure` for price comparison endpoints:
     ```javascript
     // shoppingList.ts
     getPriceComparison: premiumProcedure
       .input(z.object({ mealPlanId: z.string() }))
       .query(async ({ ctx, input }) => {
         // Return storePrices only for premium users
       }),
     ```
  2. **Option B**: Conditionally return data in existing endpoint:
     ```javascript
     return {
       ...baseData,
       // Only include price data for premium users
       storePrices:
         ctx.session.user.role === "premium" ? storePrices : undefined,
     };
     ```
  3. Apply same pattern to any future premium features
- **Status**: Open - CRITICAL (Tier bypass vulnerability)

### BUG-011: Open Redirect Vulnerability in Sign-In Page

- **Test**: SEC-003
- **Location**: `apps/web/src/app/auth/signin/page.tsx` (lines 19, 37)
- **Description**: The sign-in page reads `callbackUrl` from URL query parameters and passes it directly to `router.push()` without validating that it's a safe internal URL. An attacker can craft a malicious sign-in link with an external callback URL to redirect users to a phishing site after successful login.
- **Expected Behavior**: The `callbackUrl` parameter should only accept relative URLs on the same origin. External URLs should be rejected.
- **Actual Behavior**:
  ```javascript
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  // ... after login ...
  router.push(callbackUrl); // No validation!
  ```
- **Attack Vector**:
  1. Attacker sends victim: `https://mealplanner.com/auth/signin?callbackUrl=https://evil.com/steal-session`
  2. Victim sees legitimate domain, enters credentials
  3. After successful login, victim is redirected to attacker's site
  4. Attacker's page can request re-authentication or steal session cookies
- **Impact**: **MEDIUM SEVERITY** - Phishing attack vector. Attacker cannot directly steal credentials, but can trick authenticated users into interacting with malicious sites.
- **Recommendation**:

  ```javascript
  function isInternalUrl(url: string): boolean {
    // Only allow relative paths starting with / (not //)
    return url.startsWith('/') && !url.startsWith('//');
  }

  const rawCallback = searchParams.get('callbackUrl') ?? '/dashboard';
  const callbackUrl = isInternalUrl(rawCallback) ? rawCallback : '/dashboard';
  ```

- **Status**: Open - Security Fix Required

### BUG-010: Shopping List Items Lack Authorization - Cross-User Data Modification

- **Test**: SEC-002
- **Location**:
  - `apps/web/src/server/api/routers/shoppingList.ts` (lines 193-199, 202-214)
  - `apps/web/src/server/services/shoppingList.ts` (lines 193-206, 208-237)
- **Description**: The `toggleItemChecked` and `updateCategoryChecked` mutations in the shopping list router do not verify that the user owns the shopping list item they are trying to modify. An attacker could guess or enumerate shopping list item IDs and modify other users' shopping lists.
- **Expected Behavior**: Before modifying a shopping list item, the API should verify: ShoppingListItem → ShoppingList → MealPlan → userId === session.user.id
- **Actual Behavior**:
  1. `toggleItemChecked(itemId)` directly toggles the item with no ownership check
  2. `updateCategoryChecked(shoppingListId, category, checked)` updates all items in a category without verifying the user owns the shopping list
- **Impact**: **HIGH SEVERITY / SECURITY VULNERABILITY** - Authenticated users can modify any other user's shopping list items by providing their itemId or shoppingListId. This is an Insecure Direct Object Reference (IDOR) vulnerability.
- **Proof of Concept**:
  ```javascript
  // Attacker authenticated as userA can modify userB's shopping list
  await api.shoppingList.toggleItemChecked({ itemId: "userB-item-id" }); // ❌ Should fail
  await api.shoppingList.updateCategoryChecked({
    shoppingListId: "userB-list-id",
    category: "vegetables",
    checked: true,
  }); // ❌ Should fail
  ```
- **Recommendation**:
  In `shoppingList.ts` router, add ownership verification before operations:
  ```javascript
  toggleItemChecked: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership chain: Item → List → Plan → User
      const item = await ctx.db.shoppingListItem.findUnique({
        where: { id: input.itemId },
        include: { shoppingList: { include: { plan: true } } }
      });
      if (!item || item.shoppingList.plan.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      // Proceed with toggle
    }),
  ```
- **Status**: Open - URGENT SECURITY FIX

### BUG-003: Allergen Exclusion Filter Completely Non-Functional

- **Test**: PLAN-006
- **Location**:
  - `apps/web/src/components/features/meal-plan/MealPlanWizard.tsx` (lines 26-36)
  - `apps/web/src/server/services/planGenerator.ts` (line 108)
  - `apps/web/src/server/repositories/recipes.ts` (lines 377-383)
- **Description**: The allergen exclusion feature in Advanced Options does not work at all. The frontend passes allergen names (e.g., 'gluten', 'dairy') but the backend expects database IDs (CUIDs like 'clxyz123...'). Since these never match, the filter is silently ignored and all recipes pass through unfiltered.
- **Expected Behavior**: Selecting "Gluten" in the allergen exclusion list should exclude all recipes containing gluten from the generated meal plan.
- **Actual Behavior**: Allergen selection is ignored. Users receive recipes containing the allergens they explicitly tried to exclude.
- **Root Cause**:
  - Frontend `ALLERGEN_OPTIONS` uses `id: 'gluten'` (human-readable string)
  - Database `AllergenTag.id` is a CUID (auto-generated like 'clxyz123...')
  - Backend repository filters by `allergenTagId` which expects the CUID, not the name
  - Query: `WHERE allergenTags.none.allergenTagId IN ['gluten', 'dairy']` never matches because no tags have those IDs
- **Impact**: **HIGH SEVERITY / SAFETY ISSUE** - Users with food allergies may receive recipes containing allergens they tried to exclude. This is a potential health risk.
- **Recommendation**:
  1. **Quick fix (Option B)**: Modify `buildWhereClause` in recipes.ts to filter by allergenTag.name instead of allergenTagId:
     ```javascript
     where.allergenTags = {
       none: {
         allergenTag: { name: { in: filters.excludeAllergenTagIds } },
       },
     };
     ```
  2. **Better fix (Option A)**: Lookup allergen tag IDs by name in planGenerator before querying
- **Status**: Open - URGENT

## High (Should fix before release)

### BUG-014: Meal Plan History UI Missing - Backend Unused

- **Test**: DATA-002
- **Location**:
  - `apps/web/src/server/api/routers/plan.ts` (lines 192-200) - `plan.list` API exists but unused
  - `apps/web/src/app/dashboard/page.tsx` - Only passes boolean `hasMealPlan`, not plan array
  - `apps/web/src/app/dashboard/_components/DashboardClient.tsx` - No history display component
- **Description**: The meal plan history feature has a complete backend implementation (`plan.list` returns last 10 plans) but no frontend UI exists to display or navigate to previous plans. Users cannot browse their meal plan history.
- **Expected Behavior**: Dashboard should show a list of recent meal plans with dates and links to view each one. Users should be able to access any of their previous plans.
- **Actual Behavior**:
  1. Dashboard only shows boolean `hasMealPlan` (yes/no)
  2. No "Plan History" section or similar UI exists
  3. `plan.list` API is never called from any frontend component
  4. Old plans are inaccessible without knowing the UUID
  5. "View last plan" button links to `/planner` (wrong!) instead of `/planner/last`
- **Impact**: **UX DEGRADATION** - Users lose access to their meal plan history. Previous plans are orphaned and inaccessible unless users bookmark them. This undermines the value of saved plans.
- **Backend Status**: Fully implemented
  - `plan.list` returns last 10 plans ordered by createdAt desc
  - `plan.getLast` returns most recent plan with full details
  - `/planner/last` page correctly redirects to latest plan
- **Frontend Gap**: Zero integration
  ```bash
  grep "plan.list" apps/web/src/**/*.tsx
  # Returns: No matches found
  ```
- **What's Missing**:
  1. "Plan History" section on dashboard showing recent plans
  2. Each plan card should show: start date, days, meal count
  3. Link to `/plan/[id]` for each plan
  4. Fix "View last plan" button to link to `/planner/last`
- **Recommendation**:
  1. Add `plan.list` query to dashboard page
  2. Create `PlanHistorySection` component showing recent plans
  3. Display plan cards with key info and links
  4. Fix dashboard button to use `/planner/last` instead of `/planner`
- **Status**: Open - UX Gap (Backend ready, frontend missing)

### BUG-013: User Preferences Not Loaded or Saved - Backend Unused

- **Test**: DATA-001
- **Location**:
  - `apps/web/src/server/api/routers/preferences.ts` - Backend API (fully functional but unused)
  - `apps/web/src/components/features/meal-plan/MealPlanWizard.tsx` (lines 53-65) - Uses local state with hardcoded defaults
  - `apps/web/src/app/planner/page.tsx` - Does not fetch or save preferences
- **Description**: The user preferences system has a complete backend implementation (API endpoints, database model, validation) that is never used by the frontend. Users cannot save their preferences, and returning users always see default values instead of their previous settings.
- **Expected Behavior**: When a user returns to /planner, their previous preferences (household size, meals per day, dietary restrictions, etc.) should be pre-filled. After generating a plan, preferences should be saved for next time.
- **Actual Behavior**:
  1. MealPlanWizard always starts with hardcoded defaults (householdSize=2, mealsPerDay=1, etc.)
  2. No call to `api.preferences.get.useQuery()` to load saved preferences
  3. No call to `api.preferences.update.useMutation()` to save preferences
  4. User preferences do NOT persist across sessions
- **Impact**: **UX DEGRADATION** - Users must re-enter their preferences every time they create a meal plan. Especially frustrating for users with dietary restrictions who must set vegetarian/dairy-free options repeatedly.
- **Backend Status**: Fully implemented and tested
  - `preferences.get` returns saved preferences or defaults
  - `preferences.update` validates and upserts preferences
  - Database model UserPreferences exists with all required fields
  - Unit tests pass for both endpoints
- **Frontend Gap**: Zero integration
  ```bash
  grep "preferences\.get\|api\.preferences" apps/web/src/**/*.tsx
  # Returns: No matches found
  ```
- **Recommendation**:
  1. Modify MealPlanWizard to accept `initialPreferences` prop
  2. In planner/page.tsx, fetch preferences: `const { data } = api.preferences.get.useQuery()`
  3. Pass loaded preferences to wizard
  4. After plan generation, save preferences: `api.preferences.update.useMutation()`
  5. Optional: Add "Remember these settings" checkbox
- **Status**: Open - UX Gap (Backend ready, frontend missing)

### BUG-005: Price Comparison Feature Completely Disconnected from UI

- **Test**: SHOP-004
- **Location**:
  - `apps/web/src/app/plan/[id]/page.tsx` (line 94) - ShoppingList rendered without onComparePrices prop
  - `apps/web/src/components/features/shopping/ShoppingList.tsx` (lines 290-301) - Button logic requires prop
  - `apps/web/src/components/features/dashboard/PremiumPreviewModal.tsx` - Uses static mock data only
- **Description**: The price comparison feature, which is advertised as a premium benefit ("Find the best value supermarkets – save €20+ weekly"), is completely non-functional. The backend API (`getForMealPlan`) correctly calculates and returns store prices, but the frontend never calls it or displays the data.
- **Expected Behavior**: Premium users should see a "Compare Prices" button on their shopping list, and clicking it should show real price comparisons from Aldi, Lidl, Tesco, and Dunnes based on their actual shopping list items.
- **Actual Behavior**:
  1. The "Compare Prices" button is never rendered because `onComparePrices` prop is not passed
  2. No component exists to display real prices for premium users
  3. `PremiumPreviewModal` shows only static mock data with badge "Example with Sample Data"
  4. Premium and free users have identical (broken) experience
- **Impact**: Premium users are paying for a feature that doesn't work. This is false advertising and could lead to refund requests or customer complaints.
- **Backend Status**: Fully implemented and tested
  - `getForMealPlan` in shoppingList.ts calculates storePrices from PriceBaseline data
  - Returns `storePrices` array sorted by price and `cheapestStore`
  - Unit tests verify correct behavior
- **What's Missing**:
  1. Pass `onComparePrices` callback to ShoppingList in plan/[id]/page.tsx
  2. Create PriceComparisonModal that calls `getForMealPlan` and displays real prices
  3. Add state management for modal visibility
  4. Differentiate between free (show sample data) and premium (show real data)
- **Recommendation**:
  1. Add modal state to plan page client component
  2. Pass `onComparePrices={() => setShowModal(true)}` to ShoppingList
  3. Create new `PriceComparisonModal` that fetches from `getForMealPlan`
  4. Use `isPremiumUser(session?.user)` to switch between real data (premium) and teaser (free)
- **Status**: Open - IMPORTANT (Premium feature completely broken)

### BUG-002: /planner Page Lacks Authentication Redirect

- **Test**: AUTH-006
- **Location**: `apps/web/src/app/planner/page.tsx`
- **Description**: The /planner page is a client component that renders the MealPlanWizard for unauthenticated users. While the backend API (plan.generate) correctly rejects unauthenticated requests, the frontend allows users to fill out the entire form before receiving an error. This creates a poor user experience.
- **Expected Behavior**: Unauthenticated users should be redirected to /auth/signin?callbackUrl=/planner before seeing the wizard.
- **Actual Behavior**: Page renders, user fills out form, clicks "Create My Plan", and receives a confusing error when the tRPC call fails with UNAUTHORIZED.
- **Impact**: Users waste time filling out a form they cannot submit. Creates confusion and frustration.
- **Recommendation**:
  1. Add a wrapper server component that checks auth and redirects, OR
  2. Add a layout.tsx in /planner with server-side auth check, OR
  3. Add useEffect in PlannerPage to redirect if !session (less ideal, causes flash)
- **Status**: Open

## Medium (Should fix soon after release)

### BUG-004: Recipe Ingredient Quantities Not Scaled for Servings

- **Test**: PLAN-008
- **Location**: `apps/web/src/components/features/recipe/RecipeDetailModal.tsx` (lines 278-294)
- **Description**: When viewing a recipe in a meal plan, ingredient quantities are displayed without scaling for the user's household size. The recipe shows the original quantities (based on `servingsDefault`, typically 4) regardless of whether the user is cooking for 2, 4, or 6 people.
- **Expected Behavior**: If user generates a plan with household size 2 and views a recipe with servingsDefault=4, ingredient quantities should be halved.
- **Actual Behavior**: Recipe always displays original quantities (e.g., "2 cups rice" for servingsDefault=4) even when cooking for 2 people.
- **Impact**: Users following the displayed quantities will prepare incorrect amounts of food - too much or too little depending on their household size vs the recipe default.
- **Root Cause**:
  - `servings` is correctly stored in MealPlanItem and passed to RecipeDetailModal
  - Line 286 displays `{ri.quantity} {ri.unit}` directly without scaling
  - Missing: `scaleFactor = servings / recipe.servingsDefault`
  - Shopping list service correctly implements this scaling (shoppingList.ts:86-90)
- **Evidence of Partial Implementation**:
  - Nutritional calculation IS scaled: `recipe.calories * servings` (line 317)
  - Shopping list quantities ARE scaled correctly
  - Only recipe detail ingredient display was missed
- **Recommendation**:
  Add scaling to RecipeDetailModal.tsx:
  ```javascript
  const scaleFactor = servings / recipe.servingsDefault;
  // ...
  <span>
    {(ri.quantity * scaleFactor).toFixed(1)} {ri.unit}
  </span>;
  ```
  Also add context: "(for {servings} servings)" near ingredients header.
- **Status**: Open

## Low (Nice to fix)

### BUG-006: Navigation Header Visible in Print View

- **Test**: EXPORT-002
- **Location**:
  - `apps/web/src/app/_components/ConditionalHeader.tsx` (line 10)
  - `apps/web/src/components/layout/Header.tsx` (line 56)
- **Description**: When users navigate to the print view at `/plan/[id]/print`, the full navigation header (MealMind logo, Dashboard link, user email, Sign out button) is visible and will be printed. The print view is meant to be a clean, printer-friendly output without UI chrome.
- **Expected Behavior**: Print view should display only the meal plan content - no navigation bar or interactive UI elements should appear in the printed output.
- **Actual Behavior**: The ConditionalHeader only hides the header on `/`, `/auth/*`, and `/planner` routes. The print path `/plan/[id]/print` does not match any hide pattern, so the header is rendered. Additionally, the Header component lacks a `no-print` CSS class.
- **Impact**: Printed meal plans have the website navigation bar at the top of every page, looking unprofessional and wasting paper/ink.
- **Recommendation**: Either:
  1. Add print routes to ConditionalHeader's hideHeader check:
     ```javascript
     const hideHeader =
       pathname === "/" ||
       pathname.startsWith("/auth/") ||
       pathname === "/planner" ||
       pathname.includes("/print");
     ```
  2. OR add `no-print` class to Header's `<nav>` element (line 56)
- **Status**: Open

### BUG-001: Missing Password Confirmation Field on Signup

- **Test**: AUTH-002
- **Location**: `apps/web/src/app/auth/signup/page.tsx`
- **Description**: The signup form lacks a "confirm password" field to verify users entered their password correctly. While not strictly required (many modern apps omit it), the test case AUTH-002 expects this validation to exist.
- **Impact**: Users could accidentally typo their password and be locked out of their account. The password reset flow would need to be used.
- **Recommendation**: Either add a confirm password field to the signup form, or update the test case to remove this expectation. Consider that the current approach with password visibility toggle may be sufficient.
- **Status**: Open

### BUG-008: Recipe Images Missing sizes Attribute - Performance Impact

- **Test**: PERF-003
- **Location**:
  - `apps/web/src/components/features/recipe/RecipeCard.tsx` (lines 137-145)
  - `apps/web/src/components/features/recipe/RecipeDetailModal.tsx` (lines 181-186)
- **Description**: Recipe images using Next.js Image component with `fill` prop are missing the required `sizes` attribute. Without it, browsers assume the image needs to fill the full viewport width and download unnecessarily large images.
- **Expected Behavior**: Images should be served at appropriate sizes for their containers:
  - RecipeCard: 160px on desktop, 100vw on mobile
  - RecipeDetailModal: 896px max (modal max-width)
- **Actual Behavior**: Browser may download 1920px+ images for 160px containers, wasting 2-3x bandwidth.
- **Impact**: Performance degradation - larger image downloads, slower page loads, higher data usage for users.
- **Recommendation**:
  1. RecipeCard.tsx line 137: Add `sizes="(min-width: 640px) 160px, 100vw"`
  2. RecipeDetailModal.tsx line 181: Add `sizes="(min-width: 896px) 896px, 100vw"`
- **Status**: Open - Performance

## Accessibility (Required for compliance)

### BUG-009: Star Ratings Invisible to Screen Readers

- **Test**: A11Y-002
- **Location**: `apps/web/src/components/features/landing/Testimonials.tsx` (lines 83-89)
- **Description**: Testimonial star ratings are completely invisible to screen reader users. The 5-star visual ratings use `aria-hidden="true"` on each star (correct for decorative icons), but there is no accessible alternative text announcing the actual rating value.
- **Expected Behavior**: Screen readers should announce "5 out of 5 stars" or similar rating text.
- **Actual Behavior**: Screen reader users perceive no rating information at all. The rating is entirely invisible.
- **Impact**: Accessibility violation. Screen reader users cannot perceive testimonial credibility ratings, missing important social proof context.
- **Recommendation**:
  ```jsx
  <div className="relative mb-4 flex gap-1">
    {Array.from({ length: testimonial.rating }).map((_, i) => (
      <Star
        key={i}
        className="h-5 w-5 fill-amber-400 text-amber-400"
        aria-hidden="true"
      />
    ))}
    <span className="sr-only">{testimonial.rating} out of 5 stars</span>
  </div>
  ```
- **Status**: Open - Accessibility

## Polish Items (UX improvements)

### BUG-007: No Toast Notification System - Uses Browser alert()

- **Test**: UI-005
- **Location**:
  - `apps/web/package.json` - No toast library installed
  - `apps/web/src/components/features/recipe/RecipeDetailModal.tsx` (line 139) - Uses `alert()`
  - `apps/web/src/app/contact/ContactForm.tsx` (line 71) - Uses `alert()`
  - `apps/web/src/app/_components/PlanPageClient.tsx` (lines 77-89) - Inline alerts only
  - `apps/web/src/components/features/plan/ExportButtons.tsx` (lines 87-91) - Inline error only
- **Description**: The application has no toast notification system. Success/error feedback is handled through a mix of inline alerts (which persist on page), browser `alert()` dialogs (blocking and ugly), and no feedback at all for many actions.
- **Expected Behavior**: Modern web apps should show ephemeral toast notifications that appear in a consistent position, auto-dismiss after 3-5 seconds, and don't block user interaction.
- **Actual Behavior**:
  1. `alert('Recipe link copied to clipboard!')` blocks the user until dismissed
  2. PDF/CSV export success: No feedback whatsoever
  3. Plan regeneration: Inline success message that persists
  4. Recipe swap success: No confirmation
  5. Sign in/up success: Just redirects, no toast
- **Impact**: Poor UX quality. Browser `alert()` feels outdated and unprofessional. Users don't get confirmation that their actions succeeded. Inline messages clutter the UI.
- **Recommendation**:
  1. Install sonner: `pnpm add sonner`
  2. Add `<Toaster position="top-right" richColors />` to root layout
  3. Replace `alert()` calls with `toast.success()`
  4. Add success toasts for: PDF export, CSV export, recipe swap, plan save
  5. Replace blocking inline errors with `toast.error()` for transient failures
- **Status**: Open - UX Polish

---

_Generated by Ralph Wiggum exploratory testing loop_
