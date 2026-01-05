# Exploratory Testing Iteration

You are conducting exploratory testing on the meal-planner-demo application to identify issues and polish requirements for production readiness.

## Your Task

1. **Read the current state**: Check `exploratory-tests.json` to see which tests have `"passes": false`
2. **Read progress**: Check `progress.txt` to see what has been tested and what issues were found
3. **Pick ONE test**: Select the first test that has `"passes": false` and hasn't been attempted yet (check progress.txt for attempted tests)
4. **Execute the test**:
   - For code/API tests: Read the relevant source files and analyze them
   - For UI tests: Describe what you would check and note any code issues found
   - Use curl or the tRPC client to test API endpoints if the server is running
5. **Record findings**: Append your results to `progress.txt`
6. **Update status**: If the test passes, update `"passes": true` in `exploratory-tests.json`

## Critical Rules

- **ONE test per iteration**: Complete only one test, then exit
- **DO NOT modify test descriptions or steps** in exploratory-tests.json
- **ONLY modify the `passes` field** when a test succeeds
- **ALWAYS append to progress.txt** - never overwrite
- **If a test fails**: Document the issue in progress.txt but leave `passes: false`
- **If you find bugs**: Add them to `bugs-found.md` for tracking

## Testing Approach (No Browser Required)

Since this runs in non-interactive mode, test by:

1. **Code Review**: Read the source files that implement the feature
2. **API Testing**: Use curl to hit endpoints (if server is at localhost:3000)
3. **Static Analysis**: Check for security issues, missing validation, error handling
4. **Configuration Review**: Verify env vars, database schema, types are correct

## Frontend/UI Tests (UI-001 through UI-006)

For UI polish tests, read and apply the guidelines from:
`.claude/plugins/frontend-design/skills/frontend-design/SKILL.md`

Evaluate components against these design quality criteria:

- **Typography**: Are fonts distinctive or generic (Inter/Roboto/Arial)?
- **Color & Theme**: Cohesive palette with CSS variables? Bold or timid?
- **Motion**: Meaningful animations or static/generic?
- **Spatial Composition**: Interesting layouts or predictable grids?
- **Visual Details**: Atmosphere/depth or flat solid backgrounds?

Flag any "AI slop" patterns: generic fonts, cliched purple gradients, predictable layouts, cookie-cutter components.
Note specific design improvements needed for production polish.

## Progress File Format

Append entries in this format:

```
================================================================================
Test: [TEST-ID] - [Description]
Date: [ISO timestamp]
Status: PASS | FAIL | BLOCKED | REVIEWED
--------------------------------------------------------------------------------
Files Reviewed:
- [path/to/file.ts] - [observations]

Code Issues Found:
- [Issue description]

API Tests (if applicable):
- [Endpoint] - [Result]

Observations:
- [Any observations about the implementation]

Verdict: [PASS/FAIL/NEEDS_MANUAL_TEST]
================================================================================
```

## Test User Credentials (from seed data)

- Free user: free@example.com / P@ssw0rd!
- Premium user: premium@example.com / P@ssw0rd!
- Admin user: admin@example.com / P@ssw0rd!

## Start Now

Read exploratory-tests.json and progress.txt, then execute the next pending test.
