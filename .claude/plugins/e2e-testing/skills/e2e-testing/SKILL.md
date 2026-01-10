---
name: e2e-testing
description: Execute comprehensive end-to-end tests for the Meal Planner application using Claude in Chrome browser automation. Use this skill when the user asks to run E2E tests, verify user journeys, check accessibility, or test professional polish criteria.
license: MIT
---

This skill guides execution of end-to-end tests for the Meal Planner application using Claude in Chrome MCP browser automation tools instead of traditional Playwright tests.

## When to Use This Skill

Use this skill when:

- User requests E2E testing or verification of user journeys
- User wants to check accessibility compliance
- User wants to verify "professional polish" quality standards
- User wants to test authentication flows, meal planning, shopping lists, or admin features
- User asks to run `/e2e-test` or similar commands

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

### Step 2: Execute Test Checklist

Load the appropriate checklist from `checklists/` directory based on the test type:

- `auth-signup.md` - Signup flow tests
- `auth-signin.md` - Signin flow tests
- `meal-planning.md` - Plan generation and viewing
- `shopping-list.md` - Shopping list functionality
- `accessibility.md` - A11y compliance checks
- `professional-polish.md` - Quality standards verification

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
