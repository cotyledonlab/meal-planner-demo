# meal-planner-demo Development Guidelines

_Last updated: 2026-01-10_

These instructions apply to the entire repository. Keep documentation DRY by leaning on `docs/REFERENCE.md` for canonical commands and stack notes.

## Project Snapshot

- Next.js 15 (App Router) with React Server Components where practical
- Strict TypeScript; avoid `any`
- tRPC v11 + React Query 5
- Prisma 6 on PostgreSQL; seed users include admin/premium/basic demo accounts (password set via `SEED_USER_PASSWORD`)
- Tailwind CSS 4, Prettier + ESLint formatting and linting
- Monorepo managed by pnpm workspaces (root scripts delegate to `apps/web`)

## Workflow Expectations

- Prefer workspace scripts in `package.json` over ad-hoc commands. Canonical lists live in [`docs/REFERENCE.md`](docs/REFERENCE.md).
- Environment setup: copy `.env.example` to `.env` and `apps/web/.env`, then run `pnpm db:push` and `pnpm db:seed` after starting Postgres (`docker compose up -d postgres`, `pnpm docker:dev`, or `./start-database.sh`).
- Tests and quality gates: use `pnpm check`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm format:write` from the repo root. See [`TESTING.md`](TESTING.md) for details.
- Deployment specifics and SMTP configuration are in [`DEPLOYMENT.md`](DEPLOYMENT.md) and [`SEEDING_DEPLOYMENT.md`](SEEDING_DEPLOYMENT.md).

## Code & Documentation Style

- Validate API inputs with Zod; keep server/client contracts type-safe via tRPC.
- Keep React components modular; prefer server components unless client interactivity is required.
- Do not wrap imports in try/catch blocks.
- Update docs when behavior or commands change. Start with [`docs/REFERENCE.md`](docs/REFERENCE.md) to avoid duplication, then add links from `README.md` or other guides as needed.

## When in Doubt

- Follow the monorepo structure outlined in `README.md` and `docs/REFERENCE.md`.
- Use seed data rather than ad-hoc database changes for demo content.
- Keep changes scoped to the core flow: preferences → 7-day meal plans → recipes → shopping lists → edits/export.

---

## Ralph Wiggum Technique

The Ralph Wiggum technique runs Claude Code in an autonomous loop to complete multi-step tasks iteratively. Each iteration picks up where the last left off, using JSON feature lists and append-only progress files.

### Archives

Previous Ralph runs are stored in `.ralph/archive/`:

| Run                              | Date       | Purpose                           | Results                 |
| -------------------------------- | ---------- | --------------------------------- | ----------------------- |
| `exploratory-testing-2026-01-05` | 2026-01-05 | Production readiness testing      | 42 tests, 14 bugs found |
| `bug-fixes-2026-01-05`           | 2026-01-05 | Fix bugs from exploratory testing | 14/14 bugs fixed        |

### Creating a New Ralph Run

1. **Create the feature list** (`features.json`):

```json
{
  "meta": {
    "project": "meal-planner-demo",
    "description": "Brief description of the run",
    "total_items": 10
  },
  "items": [
    {
      "id": "ITEM-001",
      "category": "category-name",
      "title": "Short title",
      "description": "What needs to be done",
      "acceptance_criteria": ["Criterion 1", "Criterion 2"],
      "completed": false
    }
  ]
}
```

2. **Create the prompt file** (`PROMPT.md`):

```markdown
# Task Iteration

You are [doing X] on the meal-planner-demo application.

## Your Task

1. Read `features.json` to find items with `"completed": false`
2. Read `progress.txt` to see what's been done
3. Pick ONE item and complete it
4. Append results to `progress.txt`
5. Update `"completed": true` in `features.json`

## Critical Rules

- ONE item per iteration
- DO NOT modify item descriptions
- ONLY modify the `completed` field
- ALWAYS append to progress.txt
- Run `pnpm typecheck` and `pnpm test` after changes
```

3. **Create the progress file** (`progress.txt`):

```
################################################################################
#                         PROGRESS LOG                                         #
################################################################################

Started: [date]
Items to complete: [count]
Items completed: 0

================================================================================
```

4. **Create the loop script** (`run-loop.sh`):

```bash
#!/bin/bash
set -e
PROJECT_DIR="$(pwd)"
MAX_ITERATIONS=${1:-10}

for ((i=1; i<=MAX_ITERATIONS; i++)); do
    remaining=$(grep -c '"completed": false' features.json || echo "0")
    [ "$remaining" -eq 0 ] && echo "All done!" && break

    echo "Iteration $i of $MAX_ITERATIONS ($remaining remaining)"
    claude -p --dangerously-skip-permissions "$(cat PROMPT.md)"
    sleep 2
done
```

5. **Run it**:

```bash
chmod +x run-loop.sh
./run-loop.sh 10  # max 10 iterations
```

### Best Practices

- **Clear acceptance criteria**: Each item should have measurable success conditions
- **One item per iteration**: Keeps changes atomic and reviewable
- **Append-only progress**: Never overwrite - preserves full history
- **Run tests after changes**: Include `pnpm typecheck && pnpm test` in the prompt
- **Archive when done**: Move files to `.ralph/archive/[name]-[date]/`

### When to Use Ralph

**Good fit:**

- Exploratory testing across many features
- Fixing a backlog of bugs
- Large refactors with clear steps
- Batch operations (update all files matching pattern)
- Greenfield feature implementation with defined specs

**Poor fit:**

- Ambiguous requirements
- Architectural decisions requiring human judgment
- Security-critical code needing review
- Tasks requiring real browser interaction (use manual testing)

### Reference: Archived Prompts

See `.ralph/archive/*/` for complete examples:

- `exploratory-testing-2026-01-05/EXPLORATORY_PROMPT.md` - Testing prompt
- `exploratory-testing-2026-01-05/exploratory-tests.json` - Test feature list format
- `bug-fixes-2026-01-05/BUG_FIX_PROMPT.md` - Bug fixing prompt
- `bug-fixes-2026-01-05/bug-fixes.json` - Bug feature list format

---

## Production Environment Context (Sanitized)

Keep live environment details (IPs, dashboards, SSH commands) and credentials out of the repo. Store them in your password manager / internal runbook instead.

### Demo Users

Seeded demo user accounts exist (admin/premium/basic). Password is set via `SEED_USER_PASSWORD` during seeding; do not commit the shared password to git.

### Operational Notes

If you need quick reminders for production, put them in an untracked internal file (e.g. `docs/internal/PRODUCTION.md`) or your team wiki.

---

## E2E Testing Plugin

Located at `.claude/plugins/e2e-testing/` with 96 test cases across 7 checklists:

| Checklist              | Test Cases | Coverage           |
| ---------------------- | ---------- | ------------------ |
| auth-signup.md         | 7          | SU-01 to SU-07     |
| auth-signin.md         | 7          | SI-01 to SI-07     |
| meal-planning.md       | 10         | MP-01 to MP-10     |
| shopping-list.md       | 7          | SL-01 to SL-07     |
| accessibility.md       | 20         | A11Y-01 to A11Y-20 |
| admin-features.md      | 10         | AD-01 to AD-10     |
| professional-polish.md | 28         | PP-01 to PP-28     |

Run with: `/e2e-test` skill against production URL.

---

## Recent Actions Log (2026-01-10)

### Recipe Migration

Successfully migrated 100 recipes from local database to production:

| Table             | Records |
| ----------------- | ------- |
| Recipe            | 100     |
| RecipeIngredient  | 1,085   |
| RecipeStep        | 586     |
| RecipeNutrition   | 99      |
| RecipeImage       | 100     |
| RecipeDietTag     | 208     |
| RecipeAllergenTag | 274     |

**Migration challenges resolved:**

- Column order differences between local/production schemas - used explicit column names
- Foreign key ID mismatches - used name-based lookups for ingredients/tags
- CanonicalIngredient FK - set to NULL (IDs differ between environments)

### SSH Setup

- Generated SSH key for Claude: `~/.ssh/id_ed25519_claude`
- Added both Claude and user keys to server's authorized_keys
- Fixed SSH config: `/etc/ssh/sshd_config.d/99-hardening.conf` updated to allow root login
- Resolved fail2ban blocking issue
