# Exploratory Testing Findings - Meal Planner Demo

**Test Date:** 2025-11-04
**Tested URL:** https://cotyledonlab.com/demos/meal-planner
**Test Credentials:**
- Premium User: `premium@example.com` / `P@ssw0rd!`
- Basic User: `basic@example.com` / `P@ssw0rd!`

## Summary

This document contains findings from an exploratory testing session on the Meal Planner application. Issues range from security concerns to UX improvements and missing features mentioned in specifications.

---

## Critical Issues

### 1. Security: Password Sent in Cleartext After Signup
**File:** `apps/web/src/app/auth/signup/page.tsx:62`
**Severity:** High
**Description:** There's a FIXME comment indicating that after signup, the password is sent in cleartext to sign in the user. The server should return a session token instead.

**Code Reference:**
```typescript
// FIXME return a session token from the server to negate the need to resend cleartext password
```

---

## High Priority Features

### 2. Recipe Swapping Not Implemented
**File:** `apps/web/src/app/_components/MealPlanView.tsx:119`
**Severity:** High
**Description:** The "Swap Recipe" button exists in the UI but only shows an alert saying "Recipe swapping feature coming soon!" This is a core feature mentioned in specifications.

**Current Implementation:**
```typescript
const handleSwapRecipe = () => {
  // TODO: Implement recipe swapping functionality
  alert('Recipe swapping feature coming soon!');
  handleCloseDetail();
};
```

### 3. Export Functionality Missing (PDF/CSV)
**Specification Reference:** `specs/002-project-mealmind-ai/spec.md`
**Severity:** High
**Description:** The specification mentions PDF and CSV export for meal plans and shopping lists, but this functionality is not implemented.

**Expected Features:**
- Export meal plan as PDF
- Export shopping list as CSV
- Printable view of meal plan

### 4. Password Reset Flow Not Implemented
**Documentation Reference:** `docs/AUTH.md:314`
**Severity:** High
**Description:** Authentication documentation lists "Password reset flow" as a future feature, but there's no way for users to recover their accounts if they forget passwords.

---

## Medium Priority Issues

### 5. Shopping List Progress Lost on Page Reload
**Component:** `apps/web/src/app/_components/ShoppingList.tsx`
**Severity:** Medium
**Description:** When users check items on the shopping list and reload the page, the checked state is preserved in the database, but there's no visual feedback during loading, which might confuse users.

**Enhancement:** Add loading skeleton or preserved state indicator.

### 6. No Confirmation When Creating New Plan
**File:** `apps/web/src/app/planner/page.tsx`
**Severity:** Medium
**Description:** Users can create a new meal plan without any warning that their current plan might be overwritten or lost. This could result in accidental data loss.

**Recommendation:** Add confirmation dialog before generating a new plan.

### 7. No Way to Edit or Delete Meal Plans
**Severity:** Medium
**Description:** Once a meal plan is created, users cannot delete it or edit basic parameters (days, meals per day, etc.). They can only create new plans.

**Missing Features:**
- Delete meal plan button
- Edit plan parameters
- Archive old plans

### 8. No Meal Plan History
**Severity:** Medium
**Description:** Users can only view their most recent meal plan. There's no way to access previously generated plans or maintain a history.

**Recommendation:** Add a "Previous Plans" section in the dashboard.

### 9. Shopping List Cost Estimation Not Displayed
**Database Reference:** Price baseline data exists in seed
**Severity:** Medium
**Description:** The database contains price baseline data for different supermarkets (Aldi, Lidl, Tesco, Dunnes), but this data is not used to show estimated costs on the shopping list.

**Expected Premium Feature:** Show estimated total cost and price comparison across stores.

### 10. No Nutrition Information Display
**Database Reference:** Recipe model includes calories and nutrition data
**Severity:** Medium
**Description:** Recipes in the database have nutrition information (calories, macros), but this is not prominently displayed in the meal plan view or recipe cards.

**Recommendation:**
- Show calories per serving on recipe cards
- Display daily nutrition totals
- Add nutrition disclaimer

---

## Low Priority / UX Enhancements

### 11. No "Remember Me" Option on Sign-In
**File:** `apps/web/src/app/auth/signin/page.tsx`
**Severity:** Low
**Description:** The sign-in form doesn't offer a "Remember Me" checkbox, forcing users to sign in every time their session expires.

### 12. Missing Loading Skeleton States
**Severity:** Low
**Description:** The app uses basic spinners for loading states. Modern UX patterns suggest using skeleton screens for better perceived performance.

**Affected Areas:**
- Dashboard loading
- Meal plan loading
- Shopping list loading

### 13. No Search or Filter for Recipes
**Severity:** Low
**Description:** Users cannot browse, search, or filter the recipe database. They can only see recipes that are assigned to their meal plans.

**Potential Features:**
- Browse all available recipes
- Filter by dietary restrictions
- Search by ingredient or meal type
- Save favorite recipes

### 14. No Email Verification After Signup
**File:** `apps/web/src/app/auth/signup/page.tsx`
**Severity:** Low
**Description:** Users can sign up without verifying their email address. This could lead to account security issues and fake accounts.

### 15. No User Profile or Settings Page
**Severity:** Low
**Description:** Users cannot update their profile information, change their password, or manage account settings after signup.

**Missing Features:**
- Change password
- Update email
- Update display name
- Delete account
- Notification preferences

### 16. Mobile Keyboard Overlay Issues (Potential)
**Files:** Form components throughout
**Severity:** Low
**Description:** Fixed positioning elements (like the mobile navigator FAB) might be obscured by mobile keyboard when forms are focused. This needs device testing to confirm.

### 17. No Offline Support or PWA Features
**Severity:** Low
**Description:** The application doesn't work offline or offer PWA features like "Add to Home Screen," which would be valuable for a meal planning app users access frequently.

---

## Code Quality Issues

### 18. Incomplete Test Coverage
**File:** `apps/web/src/app/_components/ShoppingList.test.tsx:180`
**Severity:** Low
**Description:** There's a TODO comment indicating a test needs better error handling:

```typescript
// TODO: Fix this test - mock needs better handling of error rollback
```

### 19. Feature-Specific Learn More Pages Needed
**File:** `apps/web/src/app/dashboard/_components/DashboardClient.tsx:155`
**Severity:** Low
**Description:** Dashboard has placeholder for "Learn More" links but pages don't exist.

---

## Enhancement Ideas

### 20. Recipe Favoriting System
**Description:** Allow users to favorite recipes so they can be easily included in future meal plans.

### 21. Meal Plan Templates
**Description:** Offer pre-made meal plan templates (e.g., "Quick & Easy Week," "Family Favorites," "Healthy High Protein") that users can customize.

### 22. Ingredient Substitution Suggestions
**Description:** Suggest alternative ingredients when users mark items as "disliked" or for dietary restrictions.

### 23. Leftover Management
**Description:** Track leftovers and suggest meals that use them to reduce food waste.

### 24. Social Features
**Description:** Allow users to share meal plans with family members or friends.

### 25. Integration with Grocery Delivery Services
**Description:** Add buttons to export shopping list to Tesco, Dunnes, SuperValu online delivery services.

### 26. Weekly Budget Tracker
**Description:** Set a weekly grocery budget and track spending against it using the price baseline data.

### 27. Meal Prep Instructions
**Description:** Add batch cooking and meal prep guidance for recipes that can be prepared in advance.

### 28. Seasonal Recipe Suggestions
**Description:** Prioritize recipes with seasonal ingredients for better prices and freshness.

### 29. Cooking Mode
**Description:** Add a hands-free cooking mode with larger text and voice commands for following recipes while cooking.

### 30. Shopping List Optimization
**Description:** Organize shopping list by supermarket aisle layout for more efficient shopping.

---

## Testing Notes

### Unable to Test (Limited by WebFetch)
Due to the client-side rendered nature of the React application, I was unable to fully test:
- Actual authentication flow on the live site
- Real meal plan generation with AI
- Shopping list interactions
- Premium vs Basic feature differences
- Mobile touch interactions
- Payment/subscription flow (if implemented)

### Recommended Manual Testing
1. Sign up as new user and verify email flow
2. Generate meal plans with different parameters
3. Test recipe swapping once implemented
4. Verify premium features are properly gated
5. Test on mobile devices (iOS Safari, Android Chrome)
6. Test shopping list persistence across sessions
7. Test with screen readers for accessibility
8. Test password reset flow once implemented

---

## Priority Recommendations

### Must Fix
1. Security issue with password in cleartext (#1)
2. Implement recipe swapping (#2)
3. Add password reset functionality (#4)

### Should Implement
1. Export functionality (PDF/CSV) (#3)
2. Meal plan deletion/editing (#7)
3. Show nutrition information (#10)
4. Display shopping list cost estimates (#9)

### Nice to Have
1. Meal plan history (#8)
2. User profile/settings page (#15)
3. Recipe browsing and search (#13)
4. Loading skeleton states (#12)
5. Email verification (#14)

---

## Conclusion

The application has a solid foundation with good code quality and modern architecture. The main gaps are:
1. **Security concerns** that should be addressed immediately
2. **Core features from specification** that are not yet implemented (recipe swapping, export)
3. **User convenience features** that would improve daily usage (history, editing, cost display)
4. **Account management** features that are standard in modern web apps

The codebase shows evidence of good practices (TODO comments, test coverage, accessibility considerations), but several features need completion before production launch.
