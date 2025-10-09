# Research Summary — Weekly Plan Generator v1

## Decision 1: Maintain a single active plan per household

- **Decision**: Overwrite the prior plan when a household generates a new one while keeping guest plans only for the active session.
- **Rationale**: Aligns with clarified UX expectations, avoids confusing history management in v1, and simplifies persistence plus cache invalidation.
- **Alternatives considered**: (a) Historical plan archive — deferred to future feature once sharing/workflows mature; (b) Manual snapshots — adds UX surface not required for initial demo.

## Decision 2: Use Redis hash cache with 24h TTL for repeat generations

- **Decision**: Cache plan JSON by hashing household prefs and request parameters for 24 hours and reuse responses when the same payload arrives.
- **Rationale**: Meets cost-control requirement, reduces GPT-5 usage, and honors constitution guidance on caching identical generations.
- **Alternatives considered**: (a) In-memory Node cache — unsuitable for multi-instance deployments; (b) Longer TTL — risks serving stale data when preferences change frequently.

## Decision 3: Execute AI orchestration via deterministic prompts and function-calling

- **Decision**: Wrap GPT-5 Codex calls with deterministic prompts and tool schemas that enforce the structured plan and recipe shape.
- **Rationale**: Satisfies spec requirement for normalized responses, simplifies Zod validation, and aids regression testing against golden prompts.
- **Alternatives considered**: (a) Free-form prompt parsing — higher validation risk; (b) Non-GPT provider — out of scope relative to constitution mandate.

## Decision 4: Generate exports server-side and stream plan progress to UI

- **Decision**: Render PDF/CSV on the server after data assembly while emitting progress events during generation.
- **Rationale**: Matches constitution export constraint, keeps sensitive data off the client, and supports the ≤20s p95 target with transparent feedback.
- **Alternatives considered**: (a) Client-side PDF rendering — violates constitution instruction; (b) No streaming feedback — conflicts with success criteria for perceived responsiveness.
