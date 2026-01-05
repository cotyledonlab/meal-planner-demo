# Bug Fix Iteration

You are fixing bugs identified during exploratory testing of the meal-planner-demo application.

## Your Task

1. **Read the bug list**: Check `bug-fixes.json` to see which bugs have `"fixed": false`
2. **Read progress**: Check `fix-progress.txt` to see what has been fixed and any notes
3. **Pick ONE bug**: Select the first bug that has `"fixed": false` and hasn't been attempted
4. **Fix the bug**:
   - Read the relevant source files
   - Implement the fix according to the `fix_approach`
   - Ensure all `acceptance_criteria` are met
   - Run relevant tests to verify the fix
5. **Record your work**: Append results to `fix-progress.txt`
6. **Update status**: If the fix is complete, update `"fixed": true` in `bug-fixes.json`

## Critical Rules

- **ONE bug per iteration**: Fix only one bug, then exit
- **DO NOT modify bug descriptions** in bug-fixes.json
- **ONLY modify the `fixed` field** when a fix is complete
- **ALWAYS append to fix-progress.txt** - never overwrite
- **Test your changes**: Run `pnpm typecheck` and `pnpm test` after fixing
- **If blocked**: Document the blocker in fix-progress.txt and move on

## Fix Priority Order

Fix bugs in this order (by severity):

1. **Critical** - Security vulnerabilities, safety issues, business-critical bugs
2. **High** - Major functionality broken, significant UX issues
3. **Medium** - Moderate issues affecting user experience
4. **Low** - Minor issues, nice-to-have fixes
5. **Accessibility** - Required for compliance
6. **Polish** - UX improvements

## Progress File Format

Append entries in this format:

```
================================================================================
Bug: [BUG-XXX] - [Title]
Date: [ISO timestamp]
Status: FIXED | PARTIAL | BLOCKED
--------------------------------------------------------------------------------
Files Modified:
- [path/to/file.ts] - [what was changed]

Implementation Notes:
- [Key decisions made during implementation]

Tests:
- typecheck: PASS/FAIL
- test: PASS/FAIL
- manual verification: [description]

Acceptance Criteria:
- [x] Criterion 1
- [x] Criterion 2
- [ ] Criterion 3 (if not met, explain why)

Verdict: FIXED / NEEDS_REVIEW / BLOCKED
================================================================================
```

## Environment

- Run `pnpm typecheck` to verify TypeScript
- Run `pnpm test` to run unit tests
- Run `pnpm lint` to check code style
- App runs at http://localhost:3000 (if dev server is running)

## Reference Files

- Bug details: `bug-fixes.json`
- Original bug reports: `bugs-found.md`
- Archived testing: `.ralph/archive/exploratory-testing-2026-01-05/`

## Start Now

Read bug-fixes.json and fix-progress.txt, then fix the next pending bug.
