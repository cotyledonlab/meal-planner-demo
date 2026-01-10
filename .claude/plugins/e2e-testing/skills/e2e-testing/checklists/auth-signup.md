# Authentication: Signup Flow Test Checklist

## Preconditions

- Application running at localhost:3000
- Clean test database (or unique email for each test)
- Browser tab ready

---

## Test Cases

### SU-01: Happy Path - Basic Tier Signup

**Priority**: P0
**Steps**:

1. Navigate to `/auth/signup`
2. Verify page loads with tier selection visible
3. Select "Basic" tier card
4. Click "Continue" button
5. Fill form:
   - Name: "Test User"
   - Email: `test-basic-{timestamp}@example.com`
   - Password: "TestPass123"
   - Confirm Password: "TestPass123"
6. Click "Create account" button
7. Wait for celebration modal

**Assertions**:

- [ ] Step indicator shows 2 steps for Basic (Plan, Details)
- [ ] Tier card shows "Free" pricing
- [ ] Form fields are focusable and have labels
- [ ] Submit button shows loading state during submission
- [ ] Celebration modal appears with confetti animation
- [ ] Modal shows user's name
- [ ] Auto-redirects to `/dashboard` after ~4 seconds
- [ ] Dashboard greeting displays user name

**Console Errors**: None expected

---

### SU-02: Happy Path - Premium Tier Signup

**Priority**: P0
**Steps**:

1. Navigate to `/auth/signup`
2. Select "Premium" tier card
3. Click "Continue"
4. Fill account details (same as SU-01)
5. Click "Continue to payment"
6. Fill mock payment form:
   - Name on card: "Test User"
   - Card number: "4242 4242 4242 4242"
   - Expiry: "12/28"
   - CVC: "123"
7. Check "I understand this is mock payment" checkbox
8. Click "Complete payment & create account"

**Assertions**:

- [ ] Step indicator shows 3 steps (Plan, Details, Payment)
- [ ] Premium tier shows "4.99/month" pricing
- [ ] Payment step shows mock payment disclaimer
- [ ] Form shows "0.00 today" pricing summary
- [ ] Submit button disabled during processing
- [ ] Celebration modal appears
- [ ] Premium badge visible on dashboard
- [ ] Console shows no errors

---

### SU-03: Validation - Empty Fields

**Priority**: P1
**Steps**:

1. Navigate to `/auth/signup`
2. Select "Basic" tier, click Continue
3. Leave all fields empty
4. Click "Create account"

**Assertions**:

- [ ] Form does NOT submit
- [ ] Inline error appears for Name field
- [ ] Inline error appears for Email field
- [ ] Inline error appears for Password field
- [ ] Focus moves to first error field
- [ ] Errors use role="alert" for screen readers

---

### SU-04: Validation - Weak Password

**Priority**: P1
**Steps**:

1. Navigate to `/auth/signup`, select Basic, Continue
2. Fill Name and Email with valid values
3. Enter weak password: "abc"
4. Enter same for Confirm Password
5. Click "Create account"

**Assertions**:

- [ ] Password field shows validation error
- [ ] Error message explains requirements (8+ chars, uppercase, number)
- [ ] Form does not submit

---

### SU-05: Validation - Mismatched Passwords

**Priority**: P1
**Steps**:

1. Navigate to signup, select Basic, Continue
2. Fill Name and Email
3. Password: "TestPass123"
4. Confirm Password: "DifferentPass123"
5. Click "Create account"

**Assertions**:

- [ ] Error: "Passwords do not match" or similar
- [ ] Both password fields may be highlighted
- [ ] Form does not submit

---

### SU-06: Error - Duplicate Email

**Priority**: P1
**Precondition**: User with email `existing@test.com` already exists
**Steps**:

1. Complete signup flow with email `existing@test.com`

**Assertions**:

- [ ] Error message: "Email already registered" or similar
- [ ] Suggests link to sign in
- [ ] Form remains filled (not cleared)
- [ ] No redirect occurs

---

### SU-07: Accessibility - Keyboard Navigation

**Priority**: P1
**Steps**:

1. Navigate to `/auth/signup`
2. Use Tab key to navigate through entire form
3. Use Enter to select tier
4. Tab through all form fields
5. Use Enter to submit

**Assertions**:

- [ ] All interactive elements are focusable
- [ ] Focus indicator visible on each element (2px+ outline)
- [ ] Tab order matches visual order
- [ ] Tier cards selectable with Enter/Space
- [ ] Form submittable with Enter key
- [ ] Escape key behavior appropriate (close modals)

---

## Polish Assertions (All Tests)

Check these for every test:

- [ ] Step indicator animates smoothly between steps
- [ ] Loading spinner appears during API calls
- [ ] Button disabled while submitting (prevents double-submit)
- [ ] Confetti animation performs well (no frame drops)
- [ ] Form preserves values when navigating back
- [ ] "Back to Home" link visible and functional
- [ ] "Already have an account? Sign in" link works
- [ ] Password field has show/hide toggle
- [ ] Mobile: Touch targets >= 44x44px
- [ ] Mobile: Form fits viewport without horizontal scroll

---

## Test Data

```javascript
const testData = {
  basicUser: {
    name: "Test Basic User",
    email: `test-basic-${Date.now()}@example.com`,
    password: "TestPass123",
  },
  premiumUser: {
    name: "Test Premium User",
    email: `test-premium-${Date.now()}@example.com`,
    password: "TestPass123",
  },
  mockPayment: {
    cardName: "Test User",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/28",
    cvc: "123",
  },
};
```

---

## Network Requests to Verify

| Endpoint            | Method | Expected Status                   |
| ------------------- | ------ | --------------------------------- |
| `/api/auth/signup`  | POST   | 200 (success) or 400 (validation) |
| `/api/auth/session` | GET    | 200 after successful signup       |
