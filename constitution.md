## Mandate
- Build a public demo for friends/family to plan weekly meals with AI, covering preference intake → 7-day (configurable) plans → recipes → shopping list → edits → export/share.
- Ship only features traceable to this loop; defer anything outside scope.

## Stack & Runtime
- Language is TypeScript only; Node.js 20+.
- Monorepo uses pnpm + Turborepo; no alternative package managers.
- Web app is Next.js App Router with React Server Components and server actions.
- API layer is tRPC or Next.js Route Handlers, every input validated with Zod.
- Database is PostgreSQL via Prisma; local dev via Docker Compose, production via managed Postgres (Neon or AWS RDS/Aurora).
- Redis optional for rate limiting and background fan-out; if used, document topology.
- AI calls use OpenAI GPT-5 Codex with function calling. Provide deterministic helper wrappers with explicit system prompts and tool schemas.
- Authentication via NextAuth passwordless email magic link; support guest mode with ephemeral session.
- Export flows run server-side PDF and CSV generation only.

## Infrastructure Targets
- Hetzner path: Docker Compose deploy, Caddy reverse proxy, zero-downtime rollout playbook.
- AWS path: App Runner or ECS Fargate behind ALB; secrets sourced from SSM Parameter Store; static assets served via S3 + CloudFront if front/back split.
- Secrets live in env stores; never commit secrets.

## Observability & Operations
- Use pino for structured logging with request IDs; redact prompts and PII except email and household prefs.
- Gate Sentry error reporting behind env flag; ensure basic metrics exposure.
- Enforce rate limits per IP/session to protect AI spend.

## Quality Gates
- Strict TypeScript, ESLint, Prettier in repo; CI blocks on type or lint errors.
- Tests: Vitest for units, Playwright smoke for vital flows; require coverage on pure logic (meal constraints).
- Reject any `any` in code; all API contracts Zod-validated.
- Performance budgets: initial HTML <150KB; TTFB <500ms p95; stream long AI responses.
- Accessibility: meet WCAG AA basics—landmarks, contrast, labels, keyboard navigation verified.
- Security: never store raw prompts; rotate secrets; provide rate limiting and background job concurrency caps.
- Cost controls: enforce per-request and per-day token caps; batch generations; hash-cache identical outputs; limit background job concurrency.

## Process Rules
- Work only through `/specify` → `/plan` → `/tasks` flow; PRs must cite spec line items and include test notes.
- Use feature flags for experimental flows (e.g., nutrition analysis).
- Database changes via Prisma migrations; one migration per PR with rollback script committed.

## AI Guardrails
- Maintain golden prompts in repo; keep regression suite of 10 fixed user profiles and run against changes.
- Refuse unsafe diet requests (extreme calorie deficits, etc.); label nutrition output as informational, not medical advice.
