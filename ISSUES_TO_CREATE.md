# GitHub Issues to Create

Based on exploratory testing session on 2025-11-04

---

## Issue 1: [SECURITY] Password sent in cleartext after signup

**Labels:** security, critical, bug
**Priority:** P0 - Critical

### Description
After user signup, the password is sent in cleartext to authenticate the user. The server should return a session token instead to avoid transmitting the password multiple times.

### Current Behavior
- User signs up with email and password
- Password is sent again to sign in the user
- Password transmitted twice across the network

### Expected Behavior
- Server should return a session token after successful signup
- Client should use token to authenticate, not resend password

### File References
- `apps/web/src/app/auth/signup/page.tsx:62`
- FIXME comment: "return a session token from the server to negate the need to resend cleartext password"

### Security Impact
- Increases exposure window for password interception
- Violates security best practices
- Could fail security audits

---

## Issue 2: Recipe swapping feature not implemented

**Labels:** enhancement, high-priority, feature
**Priority:** P1 - High

### Description
The recipe swap button exists in the meal plan view but only shows an alert saying "Recipe swapping feature coming soon!" This is mentioned as a core feature in the project specifications.

### Current Behavior
- User clicks "Swap Recipe" button on a meal
- Alert shows: "Recipe swapping feature coming soon!"
- Modal closes, nothing happens

### Expected Behavior
- User can swap a recipe for an alternative that meets the same constraints
- Alternative recipes respect dietary preferences, time limits, and allergies
- Swapped recipe updates the meal plan and shopping list

### File References
- `apps/web/src/app/_components/MealPlanView.tsx:119`
- `specs/002-project-mealmind-ai/spec.md`: Mentions "Swap meal" button

### Specification Reference
```
"Swap meal" button regenerates a single meal respecting constraints.
```

---

## Issue 3: Export functionality missing (PDF/CSV)

**Labels:** enhancement, high-priority, feature
**Priority:** P1 - High

### Description
Project specifications mention PDF and CSV export for meal plans and shopping lists, but this functionality is not implemented.

### Current Behavior
- No export buttons visible
- No way to download or print meal plans
- No CSV export for shopping lists

### Expected Behavior
- PDF export of meal plan with recipes
- CSV export of shopping list for spreadsheet import
- Printable view optimized for printing

### Specification Reference
From `specs/002-project-mealmind-ai/spec.md`:
```
Export buttons: PDF (plan + recipes condensed) and CSV (shopping list).
```

### Use Cases
- Print meal plan for kitchen reference
- Import shopping list to budgeting app
- Share meal plan with family members
- Archive meal plans offline

---

## Issue 4: Password reset flow not implemented

**Labels:** enhancement, high-priority, auth, feature
**Priority:** P1 - High

### Description
Users have no way to reset their password if they forget it. This is a critical authentication feature listed in the future roadmap.

### Current Behavior
- No "Forgot Password" link on sign-in page
- Users locked out if they forget password
- Only option is to create new account

### Expected Behavior
- "Forgot Password" link on sign-in page
- Email with password reset link
- Secure password reset flow with token validation
- Password strength requirements on reset

### File References
- `docs/AUTH.md:314` - Lists "Password reset flow" as future feature
- `apps/web/src/app/auth/signin/page.tsx` - No forgot password link

### Technical Requirements
- Generate secure reset tokens
- Email integration for reset links
- Token expiration (e.g., 1 hour)
- Rate limiting to prevent abuse

---

## Issue 5: Shopping list progress lost - no visual feedback on reload

**Labels:** bug, medium-priority, ux
**Priority:** P2 - Medium

### Description
When users check items on the shopping list and reload the page, the state is preserved in the database but there's no loading skeleton or visual feedback, which might confuse users.

### Current Behavior
- User checks items on shopping list
- Page reloads
- Brief moment where all items appear unchecked
- Then checked state appears after data loads

### Expected Behavior
- Show loading skeleton that preserves visual layout
- Or show cached state immediately while fetching fresh data
- Smooth transition to loaded state

### File References
- `apps/web/src/app/_components/ShoppingList.tsx`

### User Impact
- Users might think their progress was lost
- Creates confusion during loading states
- Poor perceived performance

---

## Issue 6: No confirmation when creating new meal plan

**Labels:** enhancement, medium-priority, ux
**Priority:** P2 - Medium

### Description
Users can create a new meal plan without any warning that their current plan might be overwritten or lost.

### Current Behavior
- User clicks "Create New Plan"
- Wizard opens immediately
- Old plan may be lost or hard to find

### Expected Behavior
- Show confirmation dialog: "Creating a new plan will replace your current plan. Continue?"
- Option to view current plan before deciding
- Or implement plan history so old plans aren't lost

### File References
- `apps/web/src/app/planner/page.tsx`

### User Impact
- Accidental data loss
- User frustration
- Loss of work

---

## Issue 7: No way to edit or delete meal plans

**Labels:** enhancement, medium-priority, feature
**Priority:** P2 - Medium

### Description
Once a meal plan is created, users cannot delete it or edit basic parameters. They can only create new plans.

### Current Behavior
- Meal plan is created
- No delete button
- No way to change days, meals per day, or other parameters
- Can only swap individual recipes (when implemented)

### Expected Behavior
- Delete meal plan button with confirmation
- Edit plan parameters (days, meals, household size)
- Archive old plans
- Restore archived plans

### Missing Features
- Delete meal plan
- Edit meal plan parameters
- Archive/unarchive functionality
- Plan management dashboard

---

## Issue 8: No meal plan history or archive

**Labels:** enhancement, medium-priority, feature
**Priority:** P2 - Medium

### Description
Users can only view their most recent meal plan. There's no way to access previously generated plans.

### Current Behavior
- Only latest meal plan accessible
- Old plans disappear or are hard to find
- No history view

### Expected Behavior
- "Previous Plans" section in dashboard
- List of past meal plans with dates
- Ability to view, archive, or restore old plans
- Search/filter plan history

### Use Cases
- Find a recipe from a past plan
- Reuse a plan that worked well
- Track meal variety over time
- Reference what was cooked last month

---

## Issue 9: Shopping list cost estimation not displayed

**Labels:** enhancement, medium-priority, premium-feature
**Priority:** P2 - Medium

### Description
Database contains price baseline data for different supermarkets (Aldi, Lidl, Tesco, Dunnes), but this data is not used to show estimated costs.

### Current Behavior
- Shopping list shows only items and quantities
- No price information
- No cost estimates or comparisons

### Expected Behavior (Premium Feature)
- Show estimated total cost for shopping list
- Compare prices across different stores
- Highlight cheapest option for each category
- Show potential savings

### Database Reference
- Price baseline data exists in `prisma/price-baselines.json`
- Seeded for Aldi, Lidl, Tesco, Dunnes Stores

### Business Value
- Key differentiator for premium tier
- Aligns with "Best Value Finder" feature in landing page
- High value for Irish family market

---

## Issue 10: Nutrition information not displayed

**Labels:** enhancement, medium-priority, feature
**Priority:** P2 - Medium

### Description
Recipes in the database have nutrition information (calories, estimated macros), but this is not prominently displayed in the meal plan view or recipe cards.

### Current Behavior
- Recipe cards show title, time, vegetarian/dairy-free badges
- No calorie or nutrition information visible
- Data exists in database but unused

### Expected Behavior
- Show calories per serving on recipe cards
- Display estimated daily nutrition totals
- Nutrition breakdown in recipe detail modal
- Add nutrition disclaimer about estimates

### Database Reference
- Recipe model includes `calories` field
- Seed data includes calorie information for all recipes

### User Value
- Health-conscious users need nutrition info
- Helps with dietary goals (weight loss, muscle gain)
- Standard feature in meal planning apps

---

## Issue 11: No "Remember Me" option on sign-in

**Labels:** enhancement, low-priority, ux
**Priority:** P3 - Low

### Description
The sign-in form doesn't offer a "Remember Me" checkbox, forcing users to sign in frequently when sessions expire.

### Current Behavior
- User must sign in every session
- No persistent session option
- Frequent re-authentication required

### Expected Behavior
- "Remember Me" checkbox on sign-in form
- Longer session duration when checked
- Secure implementation with refresh tokens

### File References
- `apps/web/src/app/auth/signin/page.tsx`

---

## Issue 12: Missing loading skeleton states

**Labels:** enhancement, low-priority, ux, performance
**Priority:** P3 - Low

### Description
The app uses basic spinners for loading states. Modern UX patterns suggest skeleton screens for better perceived performance.

### Current Behavior
- Blank screen with spinner during loading
- Layout shift when content loads
- Poor perceived performance

### Expected Behavior
- Skeleton screens that match final content layout
- Gradual content loading
- Smooth transitions
- Better perceived performance

### Affected Areas
- Dashboard loading
- Meal plan loading
- Shopping list loading
- Recipe card loading

---

## Issue 13: No search or filter for recipes

**Labels:** enhancement, low-priority, feature
**Priority:** P3 - Low

### Description
Users cannot browse, search, or filter the recipe database. They can only see recipes assigned to their meal plans.

### Current Behavior
- Recipes only visible in generated meal plans
- No recipe browsing page
- No search functionality
- No filtering options

### Expected Behavior
- Browse all available recipes
- Search by name, ingredient, or meal type
- Filter by dietary restrictions
- Save favorite recipes for future plans

### Potential Features
- Recipe library page
- Search with autocomplete
- Multi-criteria filters
- Recipe ratings and reviews
- Personal recipe collection

---

## Issue 14: No email verification after signup

**Labels:** enhancement, low-priority, auth, security
**Priority:** P3 - Low

### Description
Users can sign up without verifying their email address. This could lead to account security issues and fake accounts.

### Current Behavior
- User signs up with email and password
- Immediately authenticated
- No email verification required
- Email might be fake or typo

### Expected Behavior
- Verification email sent after signup
- User must click link to verify email
- Account limited until verified
- Resend verification option

### Security Benefits
- Confirm user owns the email address
- Reduce fake accounts
- Enable account recovery via email
- Standard security practice

---

## Issue 15: No user profile or settings page

**Labels:** enhancement, low-priority, feature
**Priority:** P3 - Low

### Description
Users cannot update their profile information, change their password, or manage account settings after signup.

### Current Behavior
- No profile page
- No settings page
- No way to change password
- No account management

### Expected Behavior
- User profile page with editable fields
- Change password functionality
- Update email address
- Update display name
- Notification preferences
- Delete account option

### Missing Features
- Profile page UI
- Password change form
- Email update with verification
- Account deletion with confirmation
- Preference management

---

## Issue 16: No offline support or PWA features

**Labels:** enhancement, low-priority, feature, mobile
**Priority:** P3 - Low

### Description
The application doesn't work offline or offer Progressive Web App (PWA) features like "Add to Home Screen."

### Current Behavior
- App requires internet connection
- No offline functionality
- No PWA manifest
- No service worker
- Not installable

### Expected Behavior
- Service worker for caching
- Offline recipe viewing
- "Add to Home Screen" prompt
- App-like experience on mobile
- Background sync for shopping list checks

### Benefits
- Better mobile experience
- Works without connection
- Faster perceived performance
- Native app-like feel
- Better user retention

---

## Issue 17: Incomplete test coverage

**Labels:** technical-debt, testing, low-priority
**Priority:** P3 - Low

### Description
There's a TODO comment indicating a test needs better error handling in the shopping list test suite.

### File References
- `apps/web/src/app/_components/ShoppingList.test.tsx:180`

### Current State
```typescript
// TODO: Fix this test - mock needs better handling of error rollback
```

### Expected Behavior
- All tests passing without TODO comments
- Proper error rollback mocking
- Complete test coverage for error states

---

## Enhancement Ideas (Future Consideration)

### 18. Recipe favoriting system
Allow users to favorite recipes for easy inclusion in future meal plans.

### 19. Meal plan templates
Pre-made templates: "Quick & Easy Week," "Family Favorites," "Healthy High Protein"

### 20. Ingredient substitution suggestions
Alternative ingredients for dietary restrictions or dislikes

### 21. Leftover management
Track leftovers and suggest meals that use them

### 22. Social features
Share meal plans with family/friends

### 23. Grocery delivery integration
Export to Tesco, Dunnes, SuperValu online ordering

### 24. Weekly budget tracker
Set budget and track spending with price data

### 25. Meal prep instructions
Batch cooking guidance for advance preparation

### 26. Seasonal recipe suggestions
Prioritize seasonal ingredients for better prices

### 27. Cooking mode
Hands-free mode with large text and voice commands

### 28. Shopping list optimization
Organize by supermarket aisle layout

---

## Priority Summary

**P0 - Critical (Fix Immediately)**
1. Password sent in cleartext after signup

**P1 - High (Next Sprint)**
2. Recipe swapping feature
3. Export functionality (PDF/CSV)
4. Password reset flow

**P2 - Medium (Backlog)**
5. Shopping list loading feedback
6. New plan confirmation dialog
7. Edit/delete meal plans
8. Meal plan history
9. Shopping list cost estimation
10. Nutrition information display

**P3 - Low (Future)**
11-17: Various UX and feature enhancements

**Future Consideration**
18-28: Enhancement ideas for post-MVP
