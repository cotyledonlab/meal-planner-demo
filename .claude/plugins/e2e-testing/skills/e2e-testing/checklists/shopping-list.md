# Shopping List Test Checklist

## Preconditions

- Application running at localhost:3000
- User signed in
- Meal plan with shopping list exists
- Browser tab ready

---

## Test Cases

### SL-01: View Shopping List

**Priority**: P0
**Precondition**: Plan with shopping list exists
**Steps**:

1. Navigate to plan page `/plan/[id]`
2. Find and click shopping list link/tab
3. Or scroll to shopping list section

**Assertions**:

- [ ] Shopping list section visible
- [ ] Items grouped by category (Produce, Dairy, Meat, etc.)
- [ ] Quantities shown correctly
- [ ] Units normalized (e.g., "2 cups" not "1 cup, 1 cup")
- [ ] Aggregated quantities for same ingredients
- [ ] Categories have headers

---

### SL-02: Check Off Items

**Priority**: P0
**Steps**:

1. Navigate to shopping list
2. Click checkbox on an item

**Assertions**:

- [ ] Checkbox toggles on click
- [ ] Item visually struck through when checked
- [ ] State persists on page refresh
- [ ] Optimistic update (immediate visual feedback)
- [ ] Animation on check (satisfying micro-interaction)

---

### SL-03: Budget Estimates (Premium)

**Priority**: P1
**Precondition**: Premium user with plan
**Steps**:

1. Navigate to shopping list as premium user
2. View budget section

**Assertions**:

- [ ] Store prices shown (Aldi, Lidl, Tesco, etc.)
- [ ] Total estimate displayed per store
- [ ] Price comparison visible
- [ ] Confidence indicator shown (if applicable)
- [ ] Prices formatted with currency symbol

---

### SL-04: Export CSV

**Priority**: P1
**Steps**:

1. Navigate to shopping list
2. Find and click "Export CSV" button
3. Confirm download

**Assertions**:

- [ ] Export button visible
- [ ] Button shows loading state during export
- [ ] File downloads successfully
- [ ] CSV contains all items with quantities
- [ ] Categories included in CSV
- [ ] Filename includes plan identifier or date

---

### SL-05: Export PDF

**Priority**: P1
**Steps**:

1. Navigate to shopping list
2. Click "Export PDF" or "Print" button

**Assertions**:

- [ ] PDF generates successfully
- [ ] PDF formatted for printing (A4/Letter)
- [ ] Includes plan title and date
- [ ] All items listed with quantities
- [ ] Categories clearly delineated
- [ ] Print preview works (if using print dialog)

---

### SL-06: Empty Shopping List

**Priority**: P2
**Steps**:

1. View a plan with no recipes (if possible)
2. Or create plan then remove all recipes

**Assertions**:

- [ ] Empty state shown
- [ ] Helpful message displayed
- [ ] Suggestion to add recipes

---

### SL-07: Category Collapse/Expand

**Priority**: P2
**Steps**:

1. View shopping list with multiple categories
2. Click category header to collapse
3. Click again to expand

**Assertions**:

- [ ] Categories collapsible (if feature exists)
- [ ] Smooth animation on collapse/expand
- [ ] Icon rotates or changes to indicate state
- [ ] All items visible when expanded

---

## Polish Assertions

- [ ] Checkbox animation is satisfying
- [ ] Category headers show item counts (e.g., "Produce (12)")
- [ ] Empty categories hidden
- [ ] Export buttons show loading state
- [ ] Mobile: list scrollable
- [ ] Mobile: sticky headers during scroll
- [ ] Checked items move to bottom or stay in place (consistent behavior)
- [ ] Touch targets >= 44x44px on mobile

---

## Accessibility Checks

- [ ] Checkboxes have accessible labels
- [ ] Category headings use proper heading level
- [ ] Export buttons have accessible names
- [ ] Keyboard can navigate all items
- [ ] Screen reader announces check state changes

---

## Network Requests

| Endpoint                              | Method | Expected     |
| ------------------------------------- | ------ | ------------ |
| `/api/trpc/shoppingList.toggle`       | POST   | 200          |
| `/api/plan/[id]/export/shopping-list` | GET    | 200 with CSV |
| `/api/plan/[id]/export/pdf`           | GET    | 200 with PDF |
