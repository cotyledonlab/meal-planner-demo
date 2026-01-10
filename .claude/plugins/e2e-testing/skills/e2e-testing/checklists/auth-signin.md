# Authentication: Sign In Flow Test Checklist

## Preconditions

- Application running at localhost:3000
- Test user exists: `basic@test.com` / `TestPass123`
- Browser tab ready

---

## Test Cases

### SI-01: Happy Path - Valid Credentials

**Priority**: P0
**Steps**:

1. Navigate to `/auth/signin`
2. Enter email: `basic@test.com`
3. Enter password: `TestPass123`
4. Click "Sign in" button

**Assertions**:

- [ ] Page loads with email and password fields
- [ ] Submit button shows loading state
- [ ] Redirects to `/dashboard`
- [ ] Session cookie set (check network requests)
- [ ] Dashboard loads with user greeting
- [ ] No console errors

---

### SI-02: Invalid Credentials - Wrong Password

**Priority**: P0
**Steps**:

1. Navigate to `/auth/signin`
2. Enter email: `basic@test.com`
3. Enter password: `WrongPassword123`
4. Click "Sign in"

**Assertions**:

- [ ] Error message appears
- [ ] Error is generic (no user enumeration - e.g., "Invalid credentials")
- [ ] Form fields NOT cleared (email remains)
- [ ] No redirect occurs
- [ ] Focus moves to error or first field

---

### SI-03: Non-Existent User

**Priority**: P1
**Steps**:

1. Navigate to `/auth/signin`
2. Enter email: `nonexistent-user@example.com`
3. Enter password: `AnyPassword123`
4. Click "Sign in"

**Assertions**:

- [ ] Error message appears
- [ ] Error is SAME as wrong password (prevents user enumeration)
- [ ] No information leak about whether email exists

---

### SI-04: Callback Redirect (Protected Route)

**Priority**: P1
**Steps**:

1. While logged out, navigate to `/planner` (protected route)
2. Should redirect to signin with callback URL
3. Complete signin with valid credentials

**Assertions**:

- [ ] Redirect to `/auth/signin?callbackUrl=/planner`
- [ ] After signin, redirects to `/planner` (not dashboard)
- [ ] Plan wizard loads correctly

---

### SI-05: Already Logged In - Redirect

**Priority**: P2
**Precondition**: User already signed in
**Steps**:

1. While logged in, navigate to `/auth/signin`

**Assertions**:

- [ ] Redirects to `/dashboard` immediately
- [ ] Does not show signin form

---

### SI-06: Forgot Password Link

**Priority**: P1
**Steps**:

1. Navigate to `/auth/signin`
2. Click "Forgot password?" link

**Assertions**:

- [ ] Link is visible and focusable
- [ ] Navigates to `/auth/forgot-password`
- [ ] Forgot password page loads correctly

---

### SI-07: Signup Link

**Priority**: P2
**Steps**:

1. Navigate to `/auth/signin`
2. Find and click "Sign up" or "Create account" link

**Assertions**:

- [ ] Link visible: "Don't have an account?" or similar
- [ ] Navigates to `/auth/signup`

---

## Polish Assertions

- [ ] Password field has show/hide toggle
- [ ] Loading state on submit button
- [ ] Error message animates in smoothly
- [ ] "Forgot password?" link visible
- [ ] Form remembers email on validation error
- [ ] Enter key submits form from any field
- [ ] Tab order: Email -> Password -> Sign in button
- [ ] Focus visible on all interactive elements

---

## Accessibility Checks

- [ ] All inputs have associated labels
- [ ] Error messages use role="alert" or aria-live
- [ ] Password toggle button has accessible name
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Form can be completed with keyboard only

---

## Network Requests

| Endpoint                         | Method | Expected Status                |
| -------------------------------- | ------ | ------------------------------ |
| `/api/auth/callback/credentials` | POST   | 200 (success) or 401 (invalid) |
| `/api/auth/session`              | GET    | 200 after successful signin    |
