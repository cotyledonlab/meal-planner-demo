# Meal Planning Flow Test Checklist

## Preconditions

- Application running at localhost:3000
- User signed in (basic or premium)
- Database seeded with recipes (minimum 20 approved)
- Browser tab ready

---

## Test Cases

### MP-01: Generate 3-Day Plan (Basic User)

**Priority**: P0
**Precondition**: Signed in as basic user
**Steps**:

1. Navigate to `/planner`
2. Verify wizard loads
3. Set household size: 2 (slider or input)
4. Select meals: Breakfast, Dinner (checkboxes)
5. Set days: 3 (slider)
6. Click "Generate Plan" or equivalent

**Assertions**:

- [ ] Wizard displays with meal preferences
- [ ] Household size control works (1-8 range)
- [ ] Meal type checkboxes selectable
- [ ] Days slider shows 3 max for basic user
- [ ] Loading state appears with progress messages
- [ ] Messages rotate: "Finding recipes...", "Building shopping list...", etc.
- [ ] Redirects to `/plan/[id]` on success
- [ ] Plan shows 3 days
- [ ] Each day shows 2 meals (breakfast + dinner)
- [ ] Total: 6 recipe cards visible
- [ ] Shopping list link/section available

---

### MP-02: Generate 7-Day Plan (Premium User)

**Priority**: P0
**Precondition**: Signed in as premium user
**Steps**:

1. Navigate to `/planner`
2. Set days to 7 (should be available for premium)
3. Configure other preferences
4. Generate plan

**Assertions**:

- [ ] Days slider allows 7 (premium feature)
- [ ] Plan shows 7 days of meals
- [ ] Premium badge or indicator visible
- [ ] Advanced filters available (difficulty, time)

---

### MP-03: Dietary Filter - Vegetarian

**Priority**: P1
**Steps**:

1. Navigate to `/planner`
2. Enable "Vegetarian" filter
3. Generate plan

**Assertions**:

- [ ] Vegetarian toggle/checkbox works
- [ ] All recipes in plan are vegetarian
- [ ] Recipe cards show vegetarian tag/badge
- [ ] No meat dishes included

---

### MP-04: Dislikes Filter

**Priority**: P1
**Steps**:

1. Navigate to `/planner`
2. Enter dislikes: "mushrooms, olives"
3. Generate plan

**Assertions**:

- [ ] Dislikes input accepts comma-separated values
- [ ] Generated recipes exclude mushrooms and olives
- [ ] Preferences persisted for future sessions

---

### MP-05: Advanced Filters (Premium)

**Priority**: P1
**Precondition**: Premium user
**Steps**:

1. Navigate to `/planner`
2. Set difficulty: EASY
3. Set max time: 30 minutes
4. Select additional diet tags
5. Generate plan

**Assertions**:

- [ ] Advanced filters section visible for premium
- [ ] Difficulty dropdown works (EASY, MEDIUM, HARD)
- [ ] Time slider/input constrains results
- [ ] Only matching recipes included
- [ ] Filter summary shown in plan

---

### MP-06: No Matching Recipes Error

**Priority**: P1
**Steps**:

1. Navigate to `/planner`
2. Set impossible filter combination (e.g., all allergens excluded)
3. Generate plan

**Assertions**:

- [ ] Error message displayed clearly
- [ ] Message suggests relaxing filters
- [ ] No partial/incomplete plan created
- [ ] User can modify filters and retry
- [ ] "Try Again" button works

---

### MP-07: Preference Persistence

**Priority**: P2
**Steps**:

1. Set preferences in wizard
2. Navigate away (e.g., to dashboard)
3. Return to `/planner`

**Assertions**:

- [ ] Previous preferences restored
- [ ] Household size matches prior selection
- [ ] Meal types pre-selected
- [ ] Days value preserved

---

### MP-08: View Generated Plan

**Priority**: P0
**Precondition**: Plan already generated
**Steps**:

1. Navigate to `/plan/[id]` (existing plan)
2. Verify plan structure

**Assertions**:

- [ ] Days organized clearly (Day 1, Day 2, etc.)
- [ ] Each meal shows recipe card
- [ ] Recipe card shows: name, image, time, difficulty
- [ ] Click on recipe expands details
- [ ] Ingredients list visible
- [ ] Instructions/steps visible
- [ ] Images load correctly (no broken images)

---

### MP-09: Swap Recipe

**Priority**: P1
**Precondition**: Viewing a plan
**Steps**:

1. Find swap button on a meal card
2. Click swap
3. Confirm swap (if dialog appears)

**Assertions**:

- [ ] Swap button visible on meal cards
- [ ] Loading state during swap
- [ ] New recipe replaces old one
- [ ] Shopping list updates automatically
- [ ] No page reload required

---

### MP-10: Plan Not Found (404)

**Priority**: P2
**Steps**:

1. Navigate to `/plan/invalid-id-here`

**Assertions**:

- [ ] 404 error page displayed
- [ ] Error message is clear
- [ ] Link back to dashboard provided
- [ ] No console errors (handled gracefully)

---

## Polish Assertions

- [ ] Sliders have smooth interaction
- [ ] Filter chips animate on add/remove
- [ ] Loading skeleton matches expected plan layout
- [ ] Rotating loading messages are encouraging
- [ ] Smooth scroll to generated content
- [ ] Recipe images have blur placeholder while loading
- [ ] Accordion animations smooth (expand/collapse)
- [ ] Day headers sticky on scroll
- [ ] Mobile: swipe between days works (if implemented)
- [ ] Print-friendly layout available

---

## Accessibility Checks

- [ ] All form controls have labels
- [ ] Sliders have aria-valuenow, aria-valuemin, aria-valuemax
- [ ] Loading state announced to screen readers
- [ ] Recipe cards keyboard navigable
- [ ] Focus management after navigation

---

## Network Requests

| Endpoint                       | Method | Expected            |
| ------------------------------ | ------ | ------------------- |
| `/api/trpc/plan.generate`      | POST   | 200 with plan data  |
| `/api/trpc/preferences.update` | POST   | 200                 |
| `/api/trpc/plan.swap`          | POST   | 200 with new recipe |
