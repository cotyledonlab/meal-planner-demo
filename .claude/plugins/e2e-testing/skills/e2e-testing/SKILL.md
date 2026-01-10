---
name: e2e-testing
description: Execute comprehensive end-to-end tests for the Meal Planner application using Claude in Chrome browser automation. Supports regression testing (checklist-based) and exploratory testing (discovery-focused). Use this skill when the user asks to run E2E tests, verify user journeys, check accessibility, or test professional polish criteria.
license: MIT
---

This skill guides execution of end-to-end tests for the Meal Planner application using Claude in Chrome MCP browser automation tools instead of traditional Playwright tests.

## Testing Modes

This plugin supports two testing approaches:

| Mode            | Purpose                                        | When to Use                                                   |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| **Regression**  | Verify known functionality against checklists  | CI/CD, release validation, specific feature verification      |
| **Exploratory** | Discover unknown bugs through creative testing | New features, pre-release, investigating user-reported issues |

### Invoking Different Modes

```
/e2e-test regression auth-signup    # Run regression tests for signup
/e2e-test regression meal-planning  # Run regression tests for meal planning
/e2e-test exploratory               # Run exploratory testing session
/e2e-test exploratory dashboard     # Focus exploratory testing on dashboard
```

## When to Use This Skill

Use this skill when:

- User requests E2E testing or verification of user journeys
- User wants to check accessibility compliance
- User wants to verify "professional polish" quality standards
- User wants to test authentication flows, meal planning, shopping lists, or admin features
- User asks to run `/e2e-test` or similar commands
- User wants to explore the app for undiscovered bugs

## Application Context

- **URL**: http://localhost:3000 (development) or deployed URL
- **Framework**: Next.js 15.5 with App Router
- **Auth**: NextAuth v5 (Credentials + Discord OAuth)
- **User Roles**: Basic (free), Premium ($4.99/mo), Admin

### Key Routes

- `/` - Landing page
- `/auth/signup` - Multi-step signup (tier selection, details, payment for premium)
- `/auth/signin` - Sign in
- `/auth/forgot-password` - Password reset request
- `/dashboard` - User dashboard (protected)
- `/planner` - Meal plan wizard (protected)
- `/plan/[id]` - View generated plan (protected)
- `/dashboard/admin/recipes` - Admin recipe management
- `/dashboard/admin/images` - Admin AI image generation

## Testing Approach

### Step 1: Initialize Browser Context

```
1. Call tabs_context_mcp to get current browser state
2. Create a new tab with tabs_create_mcp for testing
3. Navigate to the application URL
4. Take initial screenshot for baseline
```

### Step 2: Execute Test Checklist (Regression Mode)

For **regression testing**, load the appropriate checklist from `checklists/` directory:

| Checklist                | Tests              | Description                    |
| ------------------------ | ------------------ | ------------------------------ |
| `auth-signup.md`         | SU-01 to SU-07     | Signup flow tests              |
| `auth-signin.md`         | SI-01 to SI-07     | Signin flow tests              |
| `meal-planning.md`       | MP-01 to MP-10     | Plan generation and viewing    |
| `shopping-list.md`       | SL-01 to SL-07     | Shopping list functionality    |
| `accessibility.md`       | A11Y-01 to A11Y-20 | WCAG 2.1 AA compliance         |
| `admin-features.md`      | AD-01 to AD-10     | Admin dashboard tests          |
| `professional-polish.md` | PP-01 to PP-28     | Quality standards verification |

For **exploratory testing**, skip checklists and follow the Exploratory Testing Guide below.

### Step 3: Test Execution Pattern

For each test case:

1. **Setup**: Navigate to the starting URL
2. **Action**: Perform the test steps using browser tools
3. **Assert**: Verify expected outcomes using read_page, screenshots
4. **Record**: Log pass/fail status with evidence

## Claude in Chrome Tools Reference

### Navigation & Context

- `tabs_context_mcp` - Get browser context, must call first
- `tabs_create_mcp` - Create new tab for testing
- `navigate` - Go to URL or back/forward
- `resize_window` - Test responsive breakpoints

### Reading Page State

- `read_page` - Get accessibility tree (use for assertions)
- `find` - Find elements by natural language ("login button", "email input")
- `get_page_text` - Extract text content
- `read_console_messages` - Check for JS errors (use pattern filter)
- `read_network_requests` - Verify API calls

### Interactions

- `computer` - Click, type, scroll, screenshot
  - `action: "screenshot"` - Capture current state
  - `action: "left_click"` with `coordinate: [x, y]` or `ref: "ref_1"`
  - `action: "type"` with `text: "..."` - Type text
  - `action: "key"` with `text: "Tab Enter"` - Press keys
  - `action: "scroll"` with `scroll_direction: "down"`, `coordinate: [x, y]`
  - `action: "wait"` with `duration: 2` - Wait for async operations
- `form_input` - Set form values by element ref
- `javascript_tool` - Execute JS for complex assertions

### Recording

- `gif_creator` - Record test execution as GIF
  - `action: "start_recording"` before test
  - `action: "stop_recording"` after test
  - `action: "export"` with `download: true` to save

## Test Execution Workflow

### Before Starting

```javascript
// 1. Get browser context
tabs_context_mcp({ createIfEmpty: true });

// 2. Create test tab
tabs_create_mcp();

// 3. Navigate to app
navigate({ url: "http://localhost:3000", tabId: TAB_ID });

// 4. Optional: Start GIF recording
gif_creator({ action: "start_recording", tabId: TAB_ID });
computer({ action: "screenshot", tabId: TAB_ID }); // First frame
```

### During Testing

```javascript
// Find and interact with elements
find({ query: "email input", tabId: TAB_ID });
// Returns: { elements: [{ ref: "ref_1", ... }] }

form_input({ ref: "ref_1", value: "test@example.com", tabId: TAB_ID });

// Or use computer tool for clicks
computer({ action: "left_click", ref: "ref_2", tabId: TAB_ID });

// Wait for navigation/loading
computer({ action: "wait", duration: 2, tabId: TAB_ID });

// Verify state
read_page({ tabId: TAB_ID, filter: "interactive" });

// Check for errors
read_console_messages({ tabId: TAB_ID, onlyErrors: true });
```

### After Testing

```javascript
// Stop recording
computer({ action: "screenshot", tabId: TAB_ID }); // Final frame
gif_creator({ action: "stop_recording", tabId: TAB_ID });

// Export GIF with meaningful name
gif_creator({
  action: "export",
  tabId: TAB_ID,
  download: true,
  filename: "signup-flow-test.gif",
});
```

## Quality Standards ("Professional Polish")

Each test should verify:

### Visual Stability

- No layout shifts during page load
- Images have dimensions or aspect-ratio set
- Loading skeletons match final content size

### Perceived Performance

- Loading indicators appear within 100ms of action
- Buttons disabled during submission
- Progress indication for long operations

### Interaction Quality

- All clickable elements have hover states
- Focus states visible (2px outline)
- Error messages appear near relevant fields

### Accessibility

Use read_page to verify:

- All form inputs have labels
- Images have alt text
- Focus order matches visual order
- ARIA landmarks present

### Error Handling

- Inline validation before submit
- Toast notifications for async errors
- Retry buttons where applicable

## Reporting Results

After completing tests, generate a report with:

1. **Summary**: Total tests, pass/fail counts
2. **Details per test**:
   - Test ID and description
   - Steps executed
   - Expected vs actual outcome
   - Screenshot evidence (attach GIF if recorded)
   - Console errors (if any)
3. **Issues found**: Bugs, accessibility violations, polish issues
4. **Recommendations**: Prioritized fixes

## Example Test Execution

```
User: Run E2E tests for the signup flow

Claude:
1. Load checklist from checklists/auth-signup.md
2. Initialize browser context
3. For each test case (SU-01 through SU-07):
   - Navigate to /auth/signup
   - Execute test steps
   - Capture screenshots
   - Verify assertions
   - Log results
4. Generate test report with findings
```

## Test Data

Use these test credentials:

- **Basic user**: basic@test.com / TestPass123
- **Premium user**: premium@test.com / TestPass123
- **Admin user**: admin@test.com / TestPass123

For new signups, use unique emails like:

- `test-{timestamp}@example.com`

## Important Notes

- Always take screenshots before and after key actions
- Check console for errors after each page navigation
- Verify network requests complete successfully
- Test at multiple viewport sizes (mobile: 375x667, tablet: 768x1024, desktop: 1280x800)
- Record GIFs for complex multi-step flows to show test execution

---

# Exploratory Testing Guide

Exploratory testing is a creative, discovery-focused approach where the tester simultaneously learns, designs tests, and executes them. Unlike regression testing which follows predefined checklists, exploratory testing adapts in real-time based on findings.

## Exploratory Testing Principles

1. **Charter-Based Sessions**: Define a time-boxed mission (e.g., "Explore the meal planning wizard for edge cases")
2. **Note Everything**: Document unexpected behaviors, even if not bugs
3. **Follow Hunches**: If something seems suspicious, investigate deeper
4. **Think Like Users**: Consider different user personas and their workflows
5. **Break Things**: Try unexpected inputs, rapid actions, edge cases

## Session Charter Template

Before starting, define:

```
Charter: [What area to explore]
Duration: [Time limit, e.g., 30 minutes]
Focus: [Specific concerns - performance, edge cases, mobile, etc.]
Personas: [Which user types to test as]
```

## Exploration Techniques

### 1. Boundary Testing

- Empty inputs, very long strings, special characters
- Maximum/minimum values for numbers
- Future/past dates at extremes

### 2. State Manipulation

- Refresh during operations
- Back button during multi-step flows
- Multiple tabs with same session
- Network interruption simulation

### 3. Rapid Interactions

- Double-click instead of single click
- Submit forms multiple times quickly
- Rapid navigation between pages

### 4. Cross-Feature Interactions

- Create content in one area, verify in another
- Test feature combinations (e.g., vegetarian + time constraints)
- Switch between user roles mid-session

### 5. Environment Variations

- Different viewport sizes
- Slow network simulation
- Browser zoom levels (67%, 150%, 200%)

## Exploratory Session Workflow

### Phase 1: Reconnaissance (5 min)

```
1. Navigate through the target area
2. Note the main user flows
3. Identify inputs, buttons, states
4. Check console for existing errors
```

### Phase 2: Structured Exploration (20 min)

```
1. Pick a user persona
2. Attempt realistic tasks
3. Try variations and edge cases
4. Document findings in real-time
5. Take screenshots of anomalies
```

### Phase 3: Chaos Testing (5 min)

```
1. Try to break things intentionally
2. Unexpected sequences of actions
3. Invalid data combinations
4. Stress test with rapid actions
```

### Phase 4: Documentation (5 min)

```
1. Summarize bugs found
2. Note areas of concern
3. Suggest regression test additions
4. Rate areas by risk level
```

## Bug Classification

When discovering issues, classify by:

| Severity     | Description                                 | Example                   |
| ------------ | ------------------------------------------- | ------------------------- |
| **Critical** | Data loss, security issue, complete failure | Payment processed twice   |
| **High**     | Feature broken, no workaround               | Cannot generate meal plan |
| **Medium**   | Feature impaired, workaround exists         | Filter doesn't persist    |
| **Low**      | Minor issue, cosmetic                       | Slight misalignment       |

## Exploratory Testing Report Template

```markdown
## Exploratory Testing Session Report

**Date**: [Date]
**Tester**: Claude via Browser Automation
**Duration**: [X minutes]
**Charter**: [Mission statement]

### Areas Explored

- [Area 1]
- [Area 2]

### Bugs Discovered

| ID     | Severity | Description | Steps to Reproduce | Screenshot |
| ------ | -------- | ----------- | ------------------ | ---------- |
| EX-001 | High     | ...         | 1. ... 2. ...      | [link]     |

### Observations (Not Bugs)

- [Observation 1 - potential UX improvement]
- [Observation 2 - performance concern]

### Risk Assessment

- **High Risk Areas**: [Areas that need more testing]
- **Stable Areas**: [Areas that performed well]

### Recommended Regression Tests

- [New test case to add to checklist]

### Session Notes

[Free-form notes about the testing session]
```

## Example Exploratory Session

```
User: Run exploratory testing on the shopping list feature

Claude:
1. Define charter: "Explore shopping list for data integrity and UX issues"
2. Initialize browser, sign in as premium user
3. Generate a meal plan to create shopping list
4. Exploration:
   - Check all items, then uncheck rapidly
   - Add very long custom item names
   - Try adding same item twice
   - Check items then regenerate plan
   - Test on mobile viewport
   - Open shopping list in two tabs, modify both
5. Document findings with screenshots
6. Generate exploratory testing report
```

## Transitioning Findings to Regression Tests

When exploratory testing reveals bugs:

1. **Fix the bug**
2. **Create regression test** - Add to appropriate checklist:

   ```markdown
   ### EX-001: [Bug Title] → [NEW-ID]

   - **Priority**: P1
   - **Precondition**: [Setup needed]
   - **Steps**:
     1. [Step that caused the bug]
     2. [Verification step]
   - **Expected**: [Correct behavior]
   ```

3. **Link to issue** - Reference GitHub issue if created
