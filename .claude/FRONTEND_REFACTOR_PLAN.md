# Frontend Refactor Plan

## Overview

This refactor migrates the web app from ad-hoc component styling to a **shadcn/ui + Radix UI** architecture with a structured component organization.

## Current State

### Phase 1: Foundation - COMPLETE

| Component         | Old Location                        | New Location                                       | Status   |
| ----------------- | ----------------------------------- | -------------------------------------------------- | -------- |
| Header            | `_components/Header.tsx`            | `components/layout/Header.tsx`                     | Migrated |
| EmptyState        | `_components/EmptyState.tsx`        | `components/shared/EmptyState.tsx`                 | Migrated |
| RecipeCard        | `_components/RecipeCard.tsx`        | `components/features/recipe/RecipeCard.tsx`        | Migrated |
| RecipeDetailModal | `_components/RecipeDetailModal.tsx` | `components/features/recipe/RecipeDetailModal.tsx` | Migrated |
| ShoppingList      | `_components/ShoppingList.tsx`      | `components/features/shopping/ShoppingList.tsx`    | DONE     |

### New Infrastructure - COMPLETE

- **UI Primitives** (`components/ui/`): button, card, badge, dialog, sheet, input, label, checkbox, select, accordion, alert, skeleton
- **Utility** (`lib/utils.ts`): `cn()` helper for className merging
- **Types** (`types/meal-plan.ts`): Consolidated type definitions with helper functions
- **CSS Variables**: Light/dark theme support via CSS custom properties
- **Icon Library**: Migrating from Heroicons to Lucide

### Files Modified - COMPLETE

1. `package.json` - Added Radix UI, Lucide, CVA, tailwind-merge, vaul
2. `globals.css` - CSS variables for theming, accordion animations
3. `ConditionalHeader.tsx` - Import path update
4. `MealPlanView.tsx` - Updated imports, using new types
5. `DashboardClient.tsx` - Migrated to Lucide icons
6. `plan/[id]/page.tsx` - Import path update

**Build Status:** PASSING

---

## Phase 2: Migrate Remaining Components - COMPLETE

### Completed Migrations

| Component               | Old Location                          | New Location                                            | Status |
| ----------------------- | ------------------------------------- | ------------------------------------------------------- | ------ |
| Modal.tsx               | `_components/Modal.tsx`               | N/A (unused, ready for deletion)                        | DONE   |
| ExportButtons.tsx       | `_components/ExportButtons.tsx`       | `components/features/plan/ExportButtons.tsx`            | DONE   |
| Hero.tsx                | `_components/Hero.tsx`                | `components/features/landing/Hero.tsx`                  | DONE   |
| HeroImage.tsx           | `_components/HeroImage.tsx`           | `components/features/landing/HeroImage.tsx`             | DONE   |
| CTA.tsx                 | `_components/CTA.tsx`                 | `components/features/landing/CTA.tsx`                   | DONE   |
| FeatureCards.tsx        | `_components/FeatureCards.tsx`        | `components/features/landing/FeatureCards.tsx`          | DONE   |
| Testimonials.tsx        | `_components/Testimonials.tsx`        | `components/features/landing/Testimonials.tsx`          | DONE   |
| Pricing.tsx             | `_components/Pricing.tsx`             | `components/features/landing/Pricing.tsx`               | DONE   |
| PlanFilterPanel.tsx     | `_components/PlanFilterPanel.tsx`     | `components/features/meal-plan/PlanFilterPanel.tsx`     | DONE   |
| PremiumPreviewModal.tsx | `_components/PremiumPreviewModal.tsx` | `components/features/dashboard/PremiumPreviewModal.tsx` | DONE   |
| MealPlanWizard.tsx      | `_components/MealPlanWizard.tsx`      | `components/features/meal-plan/MealPlanWizard.tsx`      | DONE   |

### Files Updated with New Imports

- `app/page.tsx` - Now imports from `~/components/features/landing`
- `app/plan/[id]/page.tsx` - Imports ExportButtons from new location
- `app/_components/PlanPageClient.tsx` - Imports PlanFilterPanel from new location
- `app/dashboard/_components/DashboardClient.tsx` - Imports PremiumPreviewModal from new location
- `app/planner/page.tsx` - Imports MealPlanWizard from new location

### New Component Structure Created

```
components/features/
├── landing/
│   ├── index.ts
│   ├── Hero.tsx
│   ├── HeroImage.tsx
│   ├── CTA.tsx
│   ├── FeatureCards.tsx
│   ├── Testimonials.tsx
│   └── Pricing.tsx
├── plan/
│   └── ExportButtons.tsx
├── meal-plan/
│   ├── index.ts
│   ├── MealPlanWizard.tsx
│   └── PlanFilterPanel.tsx
└── dashboard/
    └── PremiumPreviewModal.tsx
```

**Build Status:** PASSING

---

## Phase 3: Test Updates - COMPLETE

All test files have been updated with new import paths and adjusted for component implementation changes.

### Test Import Updates

| Test File                  | Import Change                                                           | Status |
| -------------------------- | ----------------------------------------------------------------------- | ------ |
| `EmptyState.test.tsx`      | `./EmptyState` → `~/components/shared/EmptyState`                       | DONE   |
| `Header.test.tsx`          | `./Header` → `~/components/layout/Header`                               | DONE   |
| `MealPlanWizard.test.tsx`  | `./MealPlanWizard` → `~/components/features/meal-plan/MealPlanWizard`   | DONE   |
| `RecipeCard.test.tsx`      | `./RecipeCard` → `~/components/features/recipe/RecipeCard`              | DONE   |
| `ShoppingList.test.tsx`    | `./ShoppingList` → `~/components/features/shopping/ShoppingList`        | DONE   |
| `PlanFilterPanel.test.tsx` | `./PlanFilterPanel` → `~/components/features/meal-plan/PlanFilterPanel` | DONE   |
| `Hero.test.tsx`            | `./Hero` → `~/components/features/landing/Hero`                         | DONE   |
| `HeroImage.test.tsx`       | `./HeroImage` → `~/components/features/landing/HeroImage`               | DONE   |
| `FeatureCards.test.tsx`    | `./FeatureCards` → `~/components/features/landing/FeatureCards`         | DONE   |
| `Pricing.test.tsx`         | `./Pricing` → `~/components/features/landing/Pricing`                   | DONE   |
| `Testimonials.test.tsx`    | `./Testimonials` → `~/components/features/landing/Testimonials`         | DONE   |

### Test Implementation Updates

Tests were also updated to reflect component implementation changes:

1. **EmptyState.test.tsx** - Updated focus assertions from `focus-visible:outline` to `focus-visible:ring-2` (shadcn/ui Button uses ring styles)
2. **Header.test.tsx** - Updated tests to work with Radix Sheet component instead of custom mobile menu:
   - Replaced `data-testid` checks with `role="dialog"` and `data-state` attribute checks
   - Updated tests to handle Sheet's DOM persistence behavior
3. **Testimonials.test.tsx** - Removed Heroicons mock, updated star icon selector to use Lucide's `svg.lucide-star` class

**Test Status:** ALL 372 TESTS PASSING

---

## Phase 4: Cleanup - COMPLETE

### Completed Tasks

| Task                                                  | Status |
| ----------------------------------------------------- | ------ |
| Delete migrated component files from `_components/`   | DONE   |
| Migrate AdminImageGeneratorClient.tsx to Lucide icons | DONE   |
| Remove Heroicons dependency from package.json         | DONE   |

### Files Deleted from `_components/`

The following migrated component files were deleted:

- Header.tsx, EmptyState.tsx, RecipeCard.tsx, RecipeDetailModal.tsx
- ShoppingList.tsx, ShoppingList.module.css, Modal.tsx, ExportButtons.tsx
- Hero.tsx, HeroImage.tsx, CTA.tsx, FeatureCards.tsx
- Testimonials.tsx, Pricing.tsx, PlanFilterPanel.tsx
- PremiumPreviewModal.tsx, MealPlanWizard.tsx

### Files Remaining in `_components/` (Not Migrated)

These files are intentionally kept as they are page-specific or utility components:

- MealPlanView.tsx, PlanPageClient.tsx, ConditionalHeader.tsx
- SessionProvider.tsx, PageTransition.tsx, PrintAutoTrigger.tsx
- post.tsx, dashboard/PremiumFeatureCard.tsx
- All test files (test imports updated to new locations)

### Additional Migration

`AdminImageGeneratorClient.tsx` was migrated from Heroicons to Lucide:

```tsx
// Before
import {
  ArrowPathIcon,
  PhotoIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// After
import { ImageIcon, Loader2, ShieldCheck, Sparkles } from "lucide-react";
```

**Build Status:** PASSING

---

## Architecture

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── layout/          # App layout (Header, Footer, Sidebar)
│   ├── features/        # Feature-specific components
│   │   ├── recipe/      # RecipeCard, RecipeDetailModal
│   │   ├── shopping/    # ShoppingList
│   │   ├── meal-plan/   # MealPlanWizard, MealPlanView
│   │   └── dashboard/   # Dashboard-specific components
│   └── shared/          # Reusable non-primitive components (EmptyState)
├── types/
│   └── meal-plan.ts     # Consolidated type definitions
└── lib/
    └── utils.ts         # cn() helper and other utilities
```

---

## Key Changes

### Icon Migration: Heroicons to Lucide

```tsx
// Before
import { SparklesIcon } from "@heroicons/react/24/outline";

// After
import { Sparkles } from "lucide-react";
```

### Component Imports

```tsx
// Before
import RecipeCard from "./RecipeCard";
import EmptyState from "./EmptyState";

// After
import { RecipeCard } from "~/components/features/recipe/RecipeCard";
import { EmptyState } from "~/components/shared/EmptyState";
```

### Type Imports

```tsx
// Before - inline type definitions in components
type MealPlanItem = { ... };

// After - centralized types
import type { MealPlanItem, MealPlan } from '~/types/meal-plan';
```

---

## Risk Assessment

| Risk                    | Likelihood | Impact | Mitigation                                   |
| ----------------------- | ---------- | ------ | -------------------------------------------- |
| Breaking existing tests | Medium     | Low    | Tests are isolated, can update incrementally |
| Type mismatches         | Low        | Medium | TypeScript will catch at build time          |
| Styling regressions     | Low        | Medium | Visual review of affected pages              |
| Runtime errors          | Low        | High   | Build verification before commit             |

**No database or API changes** - this is purely frontend/UI refactoring.

---

## Recommended Next Steps

1. ~~**Update test files** - Phase 3, update import paths in test files~~ ✅ COMPLETE
2. ~~**Cleanup old files** - Phase 4, delete migrated files from `_components/`~~ ✅ COMPLETE
3. ~~**Remove Heroicons** - Remove `@heroicons/react` dependency from package.json~~ ✅ COMPLETE

**All phases complete!** The frontend refactor to shadcn/ui + Radix UI architecture is finished.
