# Ralph Wiggum Exploratory Testing Loop

You are running an exploratory testing session for the meal-planner-demo app.

## Your Task

1. Read `features.json` and find items where "completed": false.
2. Read `progress.txt` to understand what has been done.
3. Pick ONE item and complete it end-to-end.
4. Use the Chrome DevTools MCP server for all browser interaction and observation. If it is not available, stop and report that as the blocker (do not use curl or other tools).
5. Append results to `progress.txt` (never overwrite).
6. Update ONLY the chosen item's `completed` field to true in `features.json`.

## Test Environment

- The app must already be running locally before you begin.
- Base URL: http://localhost:3000
- Seeded users:
  - admin@example.com / P@ssw0rd!
  - premium@example.com / P@ssw0rd!
  - basic@example.com / P@ssw0rd!

## Reporting Format (append to progress.txt)

```
================================================================================
Date: <YYYY-MM-DD>
Item: <ID> - <Title>
Status: PASS | FAIL | PARTIAL
Steps:
- ...
Findings:
- ...
Notes:
- ...
```

## Critical Rules

- ONE item per iteration.
- DO NOT modify item descriptions or acceptance criteria.
- ONLY modify the `completed` field in `features.json`.
- ALWAYS append to `progress.txt`.
- Use the Chrome DevTools MCP server (no manual browser usage).
