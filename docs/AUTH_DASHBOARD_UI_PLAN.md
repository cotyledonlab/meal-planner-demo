# Auth & Dashboard UI/UX Plan

Last updated: 2025-10-19

This plan makes the Sign in / Sign up flow and the Dashboard visually appealing and consistent with the rest of the app. It also introduces clear entry points to the meal planner and tasteful placeholders for premium features.

## Goals

- Cohesive look and feel using our existing Tailwind palette; align on emerald as the primary action color (planner already uses emerald).
- Delightful, fast auth experience with clear validation and OAuth CTA.
- Dashboard that immediately offers “Plan meals” and surfaces relevant next steps.
- Non-intrusive premium marketing via tasteful, informative placeholders; unlocks integrate seamlessly later.

## Design System Notes

- Primary color: emerald (600/700 for fills, 50/100 for background chips).
- Secondary accents: blue for links only; avoid as primary CTA in auth.
- Typography: system sans per `globals.css`. Use font sizes consistent with planner: h1 3xl–4xl, body sm–base.
- Components already available: `PremiumPreviewModal`, planner wizard and cards.
- Spacing: 8px scale (2, 3, 4, 6, 8, 12). Generous white space around hero/primary actions.

## Information Architecture

- Auth
  - Two-panel layout on md+ screens: left brand panel with value props; right form card.
  - On mobile, stack vertically; form card first.
  - Include “Continue with Discord” if env is configured; otherwise hide.
- Dashboard
  - Top nav with brand and user menu (sign out).
  - Hero section: greeting + “Plan meals” primary CTA linking to `/planner`.
  - Quick actions: Resume last plan (if any), Create new plan, View shopping list (if active plan).
  - Premium section: feature cards (locked/unlocked) with short descriptions and CTA.

## Pages and Components

- components/ui/Logo.tsx
  - Simple wordmark + emoji/icon; used in auth side panel and dashboard nav.

- app/auth/\_components/AuthLayout.tsx
  - Reusable shell for Sign in / Sign up: split layout, decorative background, centered card.
  - Props: title, subtitle, children, footerSlot (for legal links).

- app/auth/signin/page.tsx
  - Use AuthLayout.
  - Form card with email/password and validation; emerald CTAs; “Continue with Discord” button when available.
  - Link to Sign up; subtle copy alignment with brand.

- app/auth/signup/page.tsx
  - Use AuthLayout for visual parity.
  - Same theming; show password requirements inline.

- app/dashboard/page.tsx
  - Replace simple box with:
    - Nav: logo, app name, user avatar/menu, Sign out.
    - Hero: greeting (uses name or email), primary “Plan meals” CTA to `/planner` and “View last plan” secondary (if exists).
    - Quick Actions: three cards with icons: New weekly plan, Open planner, Shopping list (disabled if no plan), each linking appropriately.
    - Premium Features section (see below).

- components/dashboard/PremiumFeatureCard.tsx
  - Props: title, description, icon, isPremiumUser (boolean), onClick (for CTA).
  - Renders locked state with lock icon and “Preview” CTA that opens `PremiumPreviewModal` for non-premium; unlocked state shows “Coming soon” badge if feature not implemented.

## Premium Placeholders

Initial features to display:

- Tailored nutritional requirements
  - Description: “Macros and calories tuned to your goals; diabetic- and allergy-aware options.”
- Supermarket price comparison
  - Description: “See estimated totals across Aldi, Lidl, Tesco & Dunnes to save more.”
- Pantry-aware substitutions (optional third card)
  - Description: “Auto-skip what you already have and suggest smart swaps.”

Behavior:

- Non-premium users: show lock, “Go Premium” CTA links to home pricing section (`/#pricing`) and a “Preview” CTA that opens `PremiumPreviewModal`.
- Premium users: show unlocked state with “Coming soon” badge; no lock; a neutral “Learn more” button.

## Detecting Premium Users

- Short-term (now):
  - Add `isPremium?: boolean` to `session.user` via JWT/session callbacks when the DB has it; otherwise default to false.
- Medium-term (DB-backed):
  - Prisma: add `isPremium Boolean @default(false)` to `User`.
  - In `callbacks.jwt`, include `token.isPremium = user.isPremium`.
  - In `callbacks.session`, set `session.user.isPremium = token.isPremium`.
  - Seed: mark one demo user premium for manual QA.

Note: This plan only introduces placeholders. Actual premium gating logic for planner features will be added later.

## Visual Treatments

- Auth decorative background: very light emerald gradient blob and subtle pattern; form uses white card with shadow-sm and ring.
- Buttons: emerald solid for primary; gray-outline for secondary.
- Icons: simple emoji or heroicons (if introduced later). Keep it light-weight for now (built-in emoji ok).

## Accessibility

- Inputs with associated labels, descriptive errors, and aria-live regions for form errors.
- Focus states: default Tailwind ring focus-visible 2px.
- Sufficient color contrast (emerald 600 on white; text-gray-900 for body copy).

## Implementation Notes (file-level)

- apps/web/src/app/auth/\_components/AuthLayout.tsx (new)
  - Server or client: client (uses window width responsiveness and children forms which are client).
  - Accepts slots; uses Tailwind grid for split layout.

- apps/web/src/app/auth/signin/page.tsx (update)
  - Swap blue CTA to emerald; add Discord button below divider if `process.env.DISCORD_CLIENT_ID` present (render guard via a server prop or a client-side boolean passed from a server component wrapper if needed). Keep current credential sign-in logic.

- apps/web/src/app/auth/signup/page.tsx (update)
  - Same visual treatment; ensure validation messages are styled consistently.

- apps/web/src/app/dashboard/page.tsx (update)
  - Replace current content with nav + hero + quick actions + premium cards.
  - Use existing `signOut` server action; add links to `/planner` and `/`#pricing.

- apps/web/src/app/\_components/PremiumPreviewModal.tsx (reuse)
  - Trigger from PremiumFeatureCard when user is not premium.

- apps/web/src/styles/globals.css (no change)
  - Tailwind present; palette is already compatible with emerald.

## Phased Milestones

1. Auth visual refresh
   - Build `AuthLayout` and refactor Sign in / Sign up pages to use it.
   - Replace CTA colors with emerald; add OAuth button if configured.
   - Acceptance criteria:
     - Forms centered with split layout on md+; mobile stacks.
     - Errors readable and announced; focus management works.
     - Visual parity between Sign in and Sign up.

2. Dashboard redesign
   - Implement top nav, hero with greeting + primary CTA, and quick actions.
   - Wire quick actions: Plan meals -> `/planner`; Shopping list -> `/planner` (shopping step when available later), Resume last plan can link to `/planner` for now.
   - Acceptance criteria:
     - Page loads with greeting; “Plan meals” prominent; sign out available.
     - Layout responsive and consistent with planner visuals.

3. Premium placeholders
   - Add `PremiumFeatureCard` and a Premium section with two to three placeholder tiles.
   - Non-premium: lock + “Go Premium” link and “Preview” opens modal.
   - Premium: unlocked with “Coming soon”.
   - Acceptance criteria:
     - Toggling `isPremium` in session renders correct locked/unlocked states.
     - CTAs behave as described without errors.

4. Optional: Premium flag plumbing
   - Add `isPremium` to `User` (Prisma migration) and expose in session callbacks.
   - Acceptance criteria:
     - Type-safe access to `session.user.isPremium` across app.
     - Seeded premium user visible in Dashboard as unlocked placeholders.

## Risks & Considerations

- OAuth visibility: show Discord button only when configured to avoid confusion.
- Data access for “Resume last plan”: temporary link-only approach avoids adding backend query now.
- Keep dependency footprint low (no new UI libs). Reuse Tailwind and emoji icons.

## QA Checklist

- Sign in/up
  - Keyboard only navigation works; errors read in aria-live region.
  - Mobile layout: panels stack; no overflow.
  - Discord button hidden when not configured; visible when configured.
- Dashboard
  - Greeting shows name or email; sign out works.
  - “Plan meals” leads to `/planner`.
  - Premium tiles lock/unlock per session flag; modal opens for non-premium.

## Out of Scope (for this plan)

- Actual premium purchase flow and entitlement management.
- Implementing premium feature logic beyond placeholders.
- Building a dedicated /pricing page (link to home pricing section instead).

---

If you’d like, I can implement Phase 1 and 2 right away with minimal, contained changes and no schema updates.
