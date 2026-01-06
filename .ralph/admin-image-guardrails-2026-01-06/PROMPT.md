# Task Iteration

You are implementing admin image generation guardrails for the meal-planner-demo application.

## Your Task

1. Read `features.json` to find items with "completed": false
2. Read `progress.txt` to see what's been done
3. Pick ONE item and complete it
4. Append results to `progress.txt`
5. Update "completed": true in `features.json`

## Critical Rules

- ONE item per iteration
- DO NOT modify item descriptions
- ONLY modify the `completed` field
- ALWAYS append to progress.txt
- Run `pnpm typecheck` and `pnpm test` after changes

## Constraints

- Keep changes scoped to the selected item.
- Use Redis for rate limiting and quota storage when required.
- Do not store full prompts in logs; log prompt length only.
- Ensure admin-only access is enforced for new endpoints and UI.
- Use docs/REFERENCE.md for any documentation updates.

## Output Format

Append to `progress.txt`:

- Date
- Item id/title
- Summary of changes
- Tests run and results
- Notes or follow-ups
