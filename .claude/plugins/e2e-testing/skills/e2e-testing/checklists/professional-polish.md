# Professional Polish Test Checklist

## Overview

A feature is "professionally polished" when it feels complete, refined, and production-ready. This checklist covers quality standards beyond basic functionality.

---

## Visual Stability

### PP-01: No Layout Shift

**Steps**:

1. Load each main page
2. Observe during load
3. Take screenshot before and after full load

**Assertions**:

- [ ] No visible content jump during load
- [ ] Images don't cause reflow (have dimensions)
- [ ] Fonts don't cause FOUT/FOIT (preloaded)
- [ ] Skeleton loaders match final content size
- [ ] Dynamic content doesn't push existing content

### PP-02: Image Loading

**Steps**:

1. Navigate to pages with images (recipes, landing)
2. Observe image loading behavior

**Assertions**:

- [ ] Images have width/height or aspect-ratio
- [ ] Blur placeholder during load (if implemented)
- [ ] No broken image icons
- [ ] Lazy loading for below-fold images
- [ ] Appropriate image sizes (not oversized)

---

## Perceived Performance

### PP-03: Loading States

**Steps**:

1. Trigger async operations (signin, generate plan)
2. Observe loading indicators

**Assertions**:

- [ ] Loading indicator appears within 100ms
- [ ] Button disabled during submission
- [ ] Spinner or progress bar visible
- [ ] No infinite loaders (timeout fallback)
- [ ] Loading state matches expected duration

### PP-04: Optimistic Updates

**Steps**:

1. Toggle checkbox (shopping list)
2. Observe response

**Assertions**:

- [ ] UI updates immediately (before server confirms)
- [ ] Reverts on error with notification
- [ ] No visible delay on toggle

### PP-05: Progress Indication

**Steps**:

1. Start long operation (plan generation)
2. Observe progress feedback

**Assertions**:

- [ ] Progress bar or steps shown
- [ ] Helpful messages during wait
- [ ] Estimated time or stage indication
- [ ] User knows operation is progressing

---

## Content Quality

### PP-06: No Placeholder Text

**Steps**:

1. Review all pages for lorem ipsum or TODOs

**Assertions**:

- [ ] No "Lorem ipsum" text
- [ ] No "TODO" or "FIXME" in UI
- [ ] No placeholder images
- [ ] All copy is final and reviewed

### PP-07: Empty States

**Steps**:

1. View dashboard with no plans
2. View shopping list with no items
3. Search with no results

**Assertions**:

- [ ] Helpful message shown
- [ ] Illustration or icon (optional)
- [ ] Clear call-to-action
- [ ] Not just blank space

### PP-08: Text Formatting

**Assertions**:

- [ ] Consistent capitalization (Title Case headings)
- [ ] Dates localized and formatted
- [ ] Numbers with proper separators (1,000)
- [ ] Currency symbols positioned correctly
- [ ] No orphaned words on new lines
- [ ] No truncated text without indication

---

## Interaction Quality

### PP-09: Hover States

**Steps**:

1. Hover over buttons, links, cards
2. Observe visual feedback

**Assertions**:

- [ ] All clickable elements have hover state
- [ ] Hover is subtle but visible
- [ ] Cursor changes to pointer
- [ ] Hover transitions smooth (150-200ms)

### PP-10: Focus States

**Steps**:

1. Tab through interactive elements

**Assertions**:

- [ ] Focus visible on ALL interactive elements
- [ ] Consistent focus style (2px+ outline)
- [ ] Focus ring has sufficient contrast
- [ ] Focus order logical

### PP-11: Disabled States

**Assertions**:

- [ ] Disabled buttons visually distinct
- [ ] Reduced opacity or grayed out
- [ ] Cursor: not-allowed
- [ ] Not focusable when disabled

### PP-12: Double-Submit Prevention

**Steps**:

1. Click submit button rapidly
2. Check network requests

**Assertions**:

- [ ] Button disabled after first click
- [ ] Only one request sent
- [ ] No duplicate submissions

---

## Navigation Integrity

### PP-13: Browser Back/Forward

**Steps**:

1. Navigate through app
2. Use browser back button
3. Use forward button

**Assertions**:

- [ ] Back returns to previous state
- [ ] Forward works after back
- [ ] No broken navigation states
- [ ] Scroll position restored on back

### PP-14: Deep Links

**Steps**:

1. Copy URL from plan page
2. Open in new incognito window

**Assertions**:

- [ ] Page loads correct state
- [ ] No hydration errors
- [ ] Redirects to signin if protected
- [ ] Returns to deep link after auth

### PP-15: Page Refresh

**Steps**:

1. Fill form partially
2. Refresh page

**Assertions**:

- [ ] Form state persisted (or clear warning)
- [ ] Filters persisted in URL or storage
- [ ] Current view maintained

### PP-16: Tab Titles

**Steps**:

1. Navigate to different pages
2. Check browser tab title

**Assertions**:

- [ ] Title updates per page
- [ ] Format: "Page | MealMind"
- [ ] Title meaningful and unique

---

## Error UX

### PP-17: Inline Validation

**Steps**:

1. Fill form incorrectly
2. Blur field or submit

**Assertions**:

- [ ] Error shown before submit (on blur)
- [ ] Error near relevant field
- [ ] Clear error message
- [ ] Error clears when corrected

### PP-18: Error Recovery

**Steps**:

1. Trigger error (network failure mock)
2. Look for retry option

**Assertions**:

- [ ] Retry button available
- [ ] Error explains what went wrong
- [ ] Actionable guidance provided
- [ ] User can recover without refresh

### PP-19: 404 and Error Pages

**Steps**:

1. Navigate to invalid URL
2. Trigger 500 error (if possible)

**Assertions**:

- [ ] 404 page styled (not default)
- [ ] Navigation options provided
- [ ] Search or home link
- [ ] Error pages maintain header/footer

---

## Responsiveness

### PP-20: Breakpoint Testing

**Steps**:

1. Test at 375px (mobile)
2. Test at 768px (tablet)
3. Test at 1280px (desktop)
4. Test at 1920px (large desktop)

**Assertions**:

- [ ] Layout adapts at each breakpoint
- [ ] No horizontal scroll at any size
- [ ] Navigation collapses to hamburger on mobile
- [ ] Touch targets adequate on mobile
- [ ] Content readable at all sizes

### PP-21: Mobile Navigation

**Steps**:

1. View on mobile viewport
2. Open mobile menu

**Assertions**:

- [ ] Hamburger menu visible
- [ ] Menu opens smoothly
- [ ] All nav items accessible
- [ ] Menu closable (X button or overlay)

### PP-22: Tables on Mobile

**Steps**:

1. View tables on mobile (admin recipes, etc.)

**Assertions**:

- [ ] Tables scroll horizontally OR
- [ ] Cards stack vertically
- [ ] No content cut off
- [ ] Readable without zooming

---

## Transitions and Animation

### PP-23: Page Transitions

**Assertions**:

- [ ] Transitions feel intentional
- [ ] Duration 200-300ms
- [ ] Ease-out timing function
- [ ] No janky or stuttering animations

### PP-24: Micro-Interactions

**Assertions**:

- [ ] Button press has feedback
- [ ] Toggles animate state change
- [ ] Modals fade in smoothly
- [ ] Lists animate when items added/removed

---

## Consistency

### PP-25: Spacing

**Assertions**:

- [ ] Spacing follows 4px or 8px rhythm
- [ ] Consistent padding in cards
- [ ] Uniform margins between sections
- [ ] Aligned content across pages

### PP-26: Typography

**Assertions**:

- [ ] Consistent font sizes
- [ ] Heading sizes follow hierarchy
- [ ] Line heights readable (1.4-1.6)
- [ ] Same fonts used throughout

### PP-27: Component Consistency

**Assertions**:

- [ ] Buttons same style across app
- [ ] Cards consistent in appearance
- [ ] Icons same size in context
- [ ] Colors from defined palette

### PP-28: Toast Positions

**Assertions**:

- [ ] Toasts appear in same location
- [ ] Don't overlap with content
- [ ] Stack properly if multiple
- [ ] Dismissable or auto-dismiss

---

## Testing Commands

```javascript
// Check for layout shift indicators
javascript_tool({
  tabId: TAB_ID,
  action: "javascript_exec",
  text: `
    // Check images without dimensions
    document.querySelectorAll('img:not([width]):not([height])').length
  `,
});

// Test responsive breakpoints
resize_window({ width: 375, height: 667, tabId: TAB_ID });
computer({ action: "screenshot", tabId: TAB_ID });

resize_window({ width: 768, height: 1024, tabId: TAB_ID });
computer({ action: "screenshot", tabId: TAB_ID });

resize_window({ width: 1280, height: 800, tabId: TAB_ID });
computer({ action: "screenshot", tabId: TAB_ID });
```

---

## Quality Score Guide

Rate each area 1-5:

- 5: Delightful, exceeds expectations
- 4: Professional, polished
- 3: Acceptable, functional
- 2: Noticeable issues
- 1: Broken or severely lacking

**Minimum for production**: All areas at 3+, critical paths at 4+
