# Admin Features Test Checklist

## Preconditions

- Application running at localhost:3000
- User signed in as admin (`admin@test.com`)
- AI services available (or mocked)
- Browser tab ready

---

## Test Cases

### AD-01: View Recipe List

**Priority**: P1
**Steps**:

1. Sign in as admin
2. Navigate to `/dashboard/admin/recipes`

**Assertions**:

- [ ] Recipe table loads
- [ ] Status badges visible (approved, pending, draft)
- [ ] Edit action available per row
- [ ] Delete action available per row
- [ ] Pagination or infinite scroll works
- [ ] Search/filter functionality

---

### AD-02: Create New Recipe

**Priority**: P1
**Steps**:

1. Navigate to `/dashboard/admin/recipes`
2. Click "New Recipe" or "Add Recipe"
3. Fill all required fields:
   - Name
   - Description
   - Ingredients
   - Instructions
   - Prep time, cook time
   - Difficulty
   - Dietary tags
4. Save recipe

**Assertions**:

- [ ] New recipe form loads
- [ ] Validation on required fields
- [ ] Ingredient list is dynamic (add/remove)
- [ ] Instruction steps are numbered
- [ ] Preview available before save
- [ ] Success toast on save
- [ ] Recipe appears in list after save

---

### AD-03: Edit Existing Recipe

**Priority**: P1
**Steps**:

1. Navigate to recipe list
2. Click edit on a recipe
3. Modify a field
4. Save changes

**Assertions**:

- [ ] Edit form pre-filled with existing data
- [ ] Changes persist after save
- [ ] Cancel discards changes
- [ ] Unsaved changes warning if navigating away

---

### AD-04: Delete Recipe

**Priority**: P1
**Steps**:

1. Navigate to recipe list
2. Click delete on a recipe
3. Confirm deletion

**Assertions**:

- [ ] Confirmation dialog appears
- [ ] Cancel aborts deletion
- [ ] Confirm removes recipe
- [ ] Recipe no longer in list
- [ ] Success message shown

---

### AD-05: AI Image Generation

**Priority**: P1
**Steps**:

1. Navigate to `/dashboard/admin/images`
2. Enter prompt for image
3. Click generate

**Assertions**:

- [ ] Prompt input field visible
- [ ] Generate button enabled
- [ ] Loading state with progress during generation
- [ ] Generated image appears on success
- [ ] Image can be previewed full-size
- [ ] Quota usage updated/shown

---

### AD-06: Rate Limit Hit

**Priority**: P2
**Steps**:

1. Generate images rapidly (or mock rate limit)

**Assertions**:

- [ ] Rate limit error message shown
- [ ] Message includes retry-after time
- [ ] Generate button disabled during cooldown
- [ ] Clear guidance on when to retry

---

### AD-07: Quota Exceeded

**Priority**: P2
**Steps**:

1. Exhaust daily image quota (or mock)

**Assertions**:

- [ ] Quota exceeded error displayed
- [ ] Shows reset time (next day)
- [ ] Cannot generate more images
- [ ] Dashboard shows quota status

---

### AD-08: Admin Access Control

**Priority**: P0
**Steps**:

1. Sign in as basic (non-admin) user
2. Attempt to navigate to `/dashboard/admin/recipes`

**Assertions**:

- [ ] Redirected to unauthorized or 403 page
- [ ] Admin routes not accessible to regular users
- [ ] No admin menu items visible for non-admins

---

### AD-09: Bulk Operations

**Priority**: P2
**Steps**:

1. Select multiple recipes
2. Perform bulk action (delete, change status)

**Assertions**:

- [ ] Multi-select checkboxes work
- [ ] Bulk action menu appears when items selected
- [ ] Confirmation for bulk destructive actions
- [ ] All selected items affected

---

### AD-10: Recipe Status Change

**Priority**: P1
**Steps**:

1. Find recipe with status "draft"
2. Change status to "approved"

**Assertions**:

- [ ] Status dropdown or toggle works
- [ ] Status persists after change
- [ ] Recipe available in planner after approval
- [ ] Status badge updates in list

---

## Polish Assertions

- [ ] Admin dashboard has clear navigation
- [ ] Tables sortable by columns
- [ ] Filters persist on refresh
- [ ] Actions have loading states
- [ ] Destructive actions require confirmation
- [ ] Success/error toasts displayed
- [ ] Mobile: tables scroll or stack appropriately

---

## Accessibility Checks

- [ ] Tables have proper headers
- [ ] Actions keyboard accessible
- [ ] Status badges have text (not just color)
- [ ] Modals trap focus correctly
- [ ] Forms have proper labels

---

## Security Checks

- [ ] Admin routes protected server-side
- [ ] API endpoints verify admin role
- [ ] No admin actions possible without auth
- [ ] Session expiry handled gracefully

---

## Network Requests

| Endpoint                   | Method | Expected                |
| -------------------------- | ------ | ----------------------- |
| `/api/trpc/recipe.list`    | GET    | 200 with recipes        |
| `/api/trpc/recipe.create`  | POST   | 200 or validation error |
| `/api/trpc/recipe.update`  | POST   | 200                     |
| `/api/trpc/recipe.delete`  | POST   | 200                     |
| `/api/trpc/image.generate` | POST   | 200 or rate limit       |
