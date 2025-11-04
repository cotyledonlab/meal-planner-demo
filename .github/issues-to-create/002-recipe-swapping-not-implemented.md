# Recipe swapping feature not implemented

**Labels:** enhancement, high-priority, feature, user-experience
**Priority:** P1 - High
**Milestone:** Core Features

## Description

The recipe swap button exists in the meal plan view but only shows an alert saying "Recipe swapping feature coming soon!" This is mentioned as a core feature in the project specifications and users expect it to work.

## Current Behavior

1. User views their meal plan
2. User clicks on a recipe card to open details
3. User clicks "Swap Recipe" button
4. Alert appears: "Recipe swapping feature coming soon!"
5. Modal closes without any action
6. Same recipe remains in the plan

## Expected Behavior

1. User clicks "Swap Recipe" button
2. System finds alternative recipes that match constraints:
   - Same meal type (breakfast/lunch/dinner)
   - Respects dietary preferences (vegetarian, dairy-free)
   - Meets time constraints
   - Excludes user dislikes
   - Respects allergen restrictions
3. User shown 2-3 alternative recipe options
4. User selects preferred alternative
5. Meal plan updates with new recipe
6. Shopping list automatically recalculates
7. Changes persist to database

## File References

- `apps/web/src/app/_components/MealPlanView.tsx:119`
- `apps/web/src/app/_components/RecipeDetailModal.tsx`
- Specification: `specs/002-project-mealmind-ai/spec.md`

```typescript
// Current implementation:
const handleSwapRecipe = () => {
  // TODO: Implement recipe swapping functionality
  alert('Recipe swapping feature coming soon!');
  handleCloseDetail();
};
```

## Specification Reference

From `specs/002-project-mealmind-ai/spec.md`:
> "Swap meal" button regenerates a single meal respecting constraints.

## User Stories

**As a** user who doesn't like a suggested recipe
**I want to** swap it for a different recipe
**So that** I can customize my meal plan to my preferences

**As a** user with dietary restrictions
**I want** swapped recipes to still respect my restrictions
**So that** I don't have to manually check each alternative

## Technical Approach

### Phase 1: API Implementation
1. Create tRPC mutation `plan.swapRecipe`
2. Query database for alternative recipes matching criteria
3. Update meal plan item with new recipe
4. Recalculate affected shopping list items
5. Return updated plan and shopping list

### Phase 2: UI Implementation
1. Replace alert with loading state
2. Show recipe alternatives in modal or slide-out panel
3. Display key differences (time, calories, ingredients)
4. Confirm swap and update UI optimistically
5. Handle errors gracefully

### Phase 3: Enhanced UX
1. Remember previously swapped recipes to avoid suggesting again
2. Show swap history for undo functionality
3. "Surprise me" option for random swap
4. Filter alternatives by preparation time

## Acceptance Criteria

- [ ] User can swap any recipe in their meal plan
- [ ] Alternative recipes respect all dietary preferences
- [ ] Alternative recipes respect dislikes and allergens
- [ ] Shopping list updates automatically after swap
- [ ] Changes persist to database
- [ ] Loading state shown during swap operation
- [ ] Error handling for no alternatives available
- [ ] Error handling for network failures
- [ ] Works on mobile and desktop
- [ ] Accessible via keyboard navigation

## Testing Requirements

- [ ] Unit tests for recipe matching algorithm
- [ ] Integration tests for swap mutation
- [ ] E2E tests for full swap flow
- [ ] Test with various dietary restrictions
- [ ] Test with edge cases (no alternatives available)
- [ ] Test shopping list recalculation
- [ ] Test optimistic updates and rollback

## Dependencies

- Recipe database with adequate variety
- Shopping list recalculation logic
- tRPC mutation infrastructure

## User Impact

⭐ **High User Value**
- Core feature mentioned in product demo
- Users expect this functionality
- Differentiates from simple meal planners
- Increases user satisfaction and retention

## Nice-to-Have Enhancements

- Show why a recipe was recommended
- Allow filtering alternatives by time/calories
- "Lock" recipes to prevent accidental swaps
- Batch swap multiple recipes at once
- A/B test different alternative counts (2 vs 3 vs 5)
