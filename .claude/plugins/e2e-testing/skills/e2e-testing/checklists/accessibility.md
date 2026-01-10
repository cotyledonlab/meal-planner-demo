# Accessibility Test Checklist

## Overview

This checklist covers WCAG 2.1 AA compliance across the Meal Planner application.

## Testing Approach with Claude in Chrome

Use `read_page` tool to inspect accessibility tree:

```javascript
read_page({ tabId: TAB_ID, filter: "all" });
```

Check for:

- Elements with role attributes
- Labels and accessible names
- ARIA attributes
- Heading hierarchy

---

## Page-Level Checks (All Pages)

### A11Y-01: Landmarks

**Steps**:

1. Load each main page
2. Use `read_page` to inspect structure

**Assertions**:

- [ ] `<main>` landmark present
- [ ] `<nav>` landmark for navigation
- [ ] `<header>` and `<footer>` present
- [ ] No duplicate main landmarks
- [ ] Skip link to main content (optional but recommended)

### A11Y-02: Heading Hierarchy

**Steps**:

1. Inspect headings on each page

**Assertions**:

- [ ] Single `<h1>` per page
- [ ] Headings in logical order (h1 -> h2 -> h3)
- [ ] No skipped levels (h1 -> h3 without h2)
- [ ] Headings describe content structure

### A11Y-03: Page Titles

**Steps**:

1. Navigate to each page
2. Check `document.title`

**Assertions**:

- [ ] Unique title per page
- [ ] Title describes page content
- [ ] Format: "Page Name | MealMind" or similar

---

## Form Accessibility

### A11Y-04: Form Labels

**Pages**: Signup, Signin, Contact, Planner
**Steps**:

1. Navigate to form page
2. Inspect form inputs with `read_page`

**Assertions**:

- [ ] All inputs have associated `<label>`
- [ ] Labels use `htmlFor` matching input `id`
- [ ] Placeholder is NOT sole label
- [ ] Required fields indicated
- [ ] Error messages linked with aria-describedby

### A11Y-05: Form Validation

**Steps**:

1. Submit form with errors
2. Inspect error state

**Assertions**:

- [ ] Error messages have role="alert" or aria-live
- [ ] Focus moves to first error (or error summary)
- [ ] Errors describe how to fix issue
- [ ] Invalid inputs have aria-invalid="true"

### A11Y-06: Keyboard Form Navigation

**Steps**:

1. Tab through entire form
2. Submit with Enter

**Assertions**:

- [ ] All inputs reachable via Tab
- [ ] Tab order matches visual order
- [ ] Enter submits from any field
- [ ] Escape closes dropdowns/modals
- [ ] Custom controls (sliders, date pickers) keyboard accessible

---

## Interactive Elements

### A11Y-07: Focus Visibility

**Steps**:

1. Tab through page elements
2. Observe focus indicator

**Assertions**:

- [ ] All interactive elements have visible focus
- [ ] Focus indicator >= 2px solid outline
- [ ] Sufficient contrast for focus ring
- [ ] Focus not hidden by adjacent elements

### A11Y-08: Buttons and Links

**Steps**:

1. Inspect buttons and links

**Assertions**:

- [ ] Buttons have accessible names
- [ ] Icon-only buttons have aria-label
- [ ] Links describe destination (not "click here")
- [ ] Links and buttons visually distinguishable

### A11Y-09: Custom Controls

**Components**: Sliders, toggles, dropdowns
**Assertions**:

- [ ] Sliders: aria-valuemin, aria-valuemax, aria-valuenow
- [ ] Toggles: aria-checked or aria-pressed
- [ ] Dropdowns: aria-expanded, aria-haspopup
- [ ] All controls operable with keyboard

---

## Images and Media

### A11Y-10: Image Alt Text

**Steps**:

1. Inspect images on pages (especially recipe cards)

**Assertions**:

- [ ] All `<img>` have alt attribute
- [ ] Alt text describes image content
- [ ] Decorative images have alt="" (empty)
- [ ] No images with alt="image" or "photo"

### A11Y-11: Icons

**Assertions**:

- [ ] Icon-only buttons/links have aria-label
- [ ] Decorative icons have aria-hidden="true"
- [ ] Icons don't convey information without text alternative

---

## Color and Contrast

### A11Y-12: Color Contrast

**Steps**:

1. Visually inspect text on backgrounds
2. Check form inputs, buttons, links

**Assertions**:

- [ ] Text contrast >= 4.5:1 (normal text)
- [ ] Large text contrast >= 3:1 (18pt+ or 14pt bold)
- [ ] UI components contrast >= 3:1
- [ ] Error text readable
- [ ] Disabled states sufficiently distinct

### A11Y-13: Color Not Sole Indicator

**Assertions**:

- [ ] Error states use icon + color (not color alone)
- [ ] Required fields use asterisk + color
- [ ] Chart data has patterns/labels (not just colors)

---

## Dynamic Content

### A11Y-14: Loading States

**Steps**:

1. Trigger loading (e.g., generate plan)
2. Observe screen reader behavior

**Assertions**:

- [ ] Loading announced to screen readers
- [ ] aria-busy="true" on loading containers
- [ ] Loading complete announced
- [ ] Focus managed after content loads

### A11Y-15: Modals and Dialogs

**Steps**:

1. Trigger modal (e.g., celebration modal)
2. Test keyboard behavior

**Assertions**:

- [ ] Focus trapped in modal
- [ ] Escape closes modal
- [ ] Background content inert (aria-hidden)
- [ ] Focus returns to trigger on close
- [ ] Modal has role="dialog" and aria-labelledby

### A11Y-16: Toasts and Alerts

**Assertions**:

- [ ] Toast notifications have role="alert" or aria-live
- [ ] Error toasts persist long enough to read
- [ ] Success messages announced

---

## Motion and Animation

### A11Y-17: Reduced Motion

**Steps**:

1. Enable "prefers-reduced-motion" in browser
2. Navigate app and trigger animations

**Assertions**:

- [ ] Animations respect prefers-reduced-motion
- [ ] Essential animations still visible (reduced intensity)
- [ ] No flashing content (3 flashes/sec limit)
- [ ] Auto-playing content can be paused

---

## Mobile Accessibility

### A11Y-18: Touch Targets

**Steps**:

1. Resize to mobile viewport (375x667)
2. Inspect interactive elements

**Assertions**:

- [ ] Touch targets >= 44x44px
- [ ] Adequate spacing between targets
- [ ] No elements requiring precise clicks

### A11Y-19: Zoom and Reflow

**Steps**:

1. Zoom page to 200%
2. Observe layout

**Assertions**:

- [ ] No horizontal scrolling at 200% zoom
- [ ] Content reflows correctly
- [ ] Text remains readable
- [ ] No content cut off

---

## Screen Reader Specific

### A11Y-20: Semantic Structure

**Assertions**:

- [ ] Lists use `<ul>`, `<ol>`, `<li>`
- [ ] Tables use proper `<table>` structure with headers
- [ ] Navigation uses `<nav>`
- [ ] Articles/sections properly marked up

---

## Testing Commands

```javascript
// Get full accessibility tree
read_page({ tabId: TAB_ID, filter: "all" });

// Get only interactive elements
read_page({ tabId: TAB_ID, filter: "interactive" });

// Execute accessibility check via axe (if available)
javascript_tool({
  action: "javascript_exec",
  tabId: TAB_ID,
  text: `
    // Check for images without alt
    document.querySelectorAll('img:not([alt])').length
  `,
});

// Check focus visibility
computer({ action: "key", text: "Tab", tabId: TAB_ID });
computer({ action: "screenshot", tabId: TAB_ID });
```

---

## Severity Guide

| Priority | Impact              | Example                                     |
| -------- | ------------------- | ------------------------------------------- |
| P0       | Blocks usage        | No keyboard access, missing form labels     |
| P1       | Significant barrier | Poor contrast, missing alt text             |
| P2       | Minor issue         | Suboptimal heading order, missing landmarks |
