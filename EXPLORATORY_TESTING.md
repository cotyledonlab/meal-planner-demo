# Exploratory Testing: Signup/Onboarding Flow

## Testing Date
2025-11-15

## Scope
Testing the signup and onboarding experience focusing on tier selection, pricing consistency, and user flow.

## Test Environment
- Local development server
- Browser: Chromium (via Playwright)
- Database: PostgreSQL (Docker)

---

## Test Scenarios & Findings

### 1. Homepage to Signup Flow
**Test Steps:**
1. Navigate to homepage (`/`)
2. Click "Get Started" button in Hero section
3. Verify landing on signup page with tier selection

**Findings:**
✅ **PASS** - Hero "Get Started" button correctly links to `/auth/signup`
✅ **PASS** - CTA "Get Started" button correctly links to `/auth/signup`
✅ **PASS** - User lands on tier selection step (not bypassing to account details)

**Observations:**
- Both Hero and CTA buttons use consistent styling and messaging
- No tier parameter in URL, letting user make explicit choice

---

### 2. Tier Selection Step
**Test Steps:**
1. Access signup page
2. Verify tier selection is first step
3. Check premium is default selection
4. Verify both tiers display correct information

**Findings:**
✅ **PASS** - Tier selection is the first step in signup flow
✅ **PASS** - Premium tier is pre-selected by default
✅ **PASS** - Premium tier shows "Recommended" badge
✅ **PASS** - Premium tier appears first (left side on desktop)
✅ **PASS** - Pricing matches shared constants:
  - Premium: €4.99/month
  - Free: €0
✅ **PASS** - Features list matches shared constants
✅ **PASS** - Payment notice shown for premium selection
✅ **PASS** - No payment notice shown for free selection

**Observations:**
- Clear visual distinction between selected and unselected tiers
- Premium tier has emerald border when selected
- Free tier gets emerald border when selected
- "Selected" indicator with checkmark shows on active tier

---

### 3. Premium Signup Flow (3 Steps)
**Test Steps:**
1. Select premium tier → Continue
2. Enter account details → Continue to payment
3. Enter mock payment details → Complete signup

**Findings:**
✅ **PASS** - Step progression: Tier → Details → Payment
✅ **PASS** - Step indicators show "Step 2 of 3" and "Step 3 of 3"
✅ **PASS** - Premium tier info displayed in step indicator
✅ **PASS** - Back navigation works at each step
✅ **PASS** - Mock payment form includes all required fields
✅ **PASS** - Clear messaging that payment is mock/demo

**Step Indicators:**
- Step 1: "Choose your plan"
- Step 2: "Step 2 of 3 — Account details" with "Premium Tier: €4.99/month • Advanced plan settings, longer plans, and supermarket comparisons."
- Step 3: "Step 3 of 3 — Mock payment"

---

### 4. Free Tier Signup Flow (2 Steps)
**Test Steps:**
1. Select free tier → Continue
2. Enter account details → Create account

**Findings:**
✅ **PASS** - Step progression: Tier → Details (no payment step)
✅ **PASS** - Step indicators show "Step 2 of 2"
✅ **PASS** - Free tier info displayed in step indicator
✅ **PASS** - Back navigation works
✅ **PASS** - Button text is "Create account" (not "Continue to payment")

**Step Indicators:**
- Step 1: "Choose your plan"
- Step 2: "Step 2 of 2 — Account details" with "Free Tier: Get started with basic meal planning features."

---

### 5. Pricing Consistency Audit
**Test Steps:**
1. Check all pricing references across the application
2. Verify consistency with shared constants

**Findings:**
✅ **PASS** - Pricing page uses shared constants from `@meal-planner-demo/constants`
✅ **PASS** - Signup tier selection uses shared constants
✅ **PASS** - All references show €4.99/month for premium
✅ **PASS** - Feature lists match across components

**Locations Checked:**
- `/` - Pricing component: ✅ Uses shared constants
- `/auth/signup` - TierSelection: ✅ Uses shared constants
- Dashboard upgrade CTA: Links to `/#pricing` ✅
- Premium preview modal: No hardcoded pricing shown ✅

**No Inconsistencies Found** - All pricing information is sourced from the centralized constants.

---

### 6. Navigation & Back Buttons
**Test Steps:**
1. Test "Back to plan selection" button on account details step
2. Test "Back to details" button on payment step
3. Verify tier selection is preserved

**Findings:**
✅ **PASS** - "Back to plan selection" returns to tier selection
✅ **PASS** - Previous tier selection is preserved
✅ **PASS** - "Back to details" from payment step works correctly
✅ **PASS** - Form data is preserved when navigating back

**Observations:**
- State management works correctly
- No data loss during navigation
- Clear button labels guide user

---

### 7. Direct URL Access Tests
**Test Steps:**
1. Access `/auth/signup?tier=premium` directly
2. Verify behavior

**Findings:**
✅ **PASS** - URL parameter `?tier=premium` skips tier selection, goes directly to account details
⚠️ **MINOR OBSERVATION** - This maintains backward compatibility with existing Pricing component CTAs

**Analysis:**
- The old behavior is preserved for users coming from external links
- The Pricing component "Go Premium" button still uses `?tier=premium`
- This is acceptable as it provides a shortcut for users who already made their choice on the pricing page

**Recommendation:**
- Consider if Pricing CTAs should remove the tier parameter to force tier selection
- Current implementation is valid - users who click "Go Premium" have already seen pricing and made a choice
- **DECISION:** Keep current behavior - it's a valid optimization for users from pricing page

---

### 8. Accessibility Testing
**Test Steps:**
1. Check keyboard navigation
2. Verify ARIA labels and roles
3. Check focus management

**Findings:**
✅ **PASS** - Buttons are keyboard accessible
✅ **PASS** - Form fields have proper labels
✅ **PASS** - Modal dialogs have aria-modal and aria-labelledby
✅ **PASS** - Minimum touch target sizes (44px) met
✅ **PASS** - Focus styles visible on interactive elements

---

### 9. Mobile Responsiveness
**Test Steps:**
1. Test tier selection on mobile viewport
2. Verify button sizes and spacing
3. Check form usability

**Findings:**
✅ **PASS** - Tier cards stack vertically on mobile
✅ **PASS** - Buttons meet minimum 44px touch target
✅ **PASS** - Text remains readable
✅ **PASS** - No horizontal scrolling required

---

## Summary

### Issues Found: 0 Critical, 0 Minor
No critical issues or bugs were identified during exploratory testing.

### Strengths
1. **Consistent Pricing** - All pricing information sourced from shared constants
2. **Clear User Flow** - Step-by-step progression with clear indicators
3. **Good UX** - Premium default encourages upgrade while allowing free choice
4. **Backward Compatibility** - URL parameters still work for direct links
5. **Accessibility** - Proper ARIA labels, keyboard navigation, touch targets
6. **Responsive Design** - Works well on mobile and desktop

### Recommendations for Future Enhancements
1. Consider A/B testing the default tier selection (premium vs free)
2. Add analytics to track which tier users select
3. Consider adding a comparison table directly in tier selection
4. Add testimonials or social proof in the tier selection step

### Testing Coverage
- ✅ User flows (premium and free paths)
- ✅ Pricing consistency
- ✅ Navigation and back buttons
- ✅ URL parameter handling
- ✅ Accessibility
- ✅ Mobile responsiveness
- ✅ State management
- ✅ Error handling (via existing tests)

---

## Test Evidence
Screenshots captured and included in PR description:
1. Tier selection with premium default
2. Premium account details step
3. Free tier selected
4. Free account details step

## Conclusion
The signup/onboarding flow successfully promotes premium choice during signup as required. The implementation is clean, consistent, and maintains backward compatibility. All acceptance criteria met with no issues found during exploratory testing.
