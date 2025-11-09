'use client';

import Link from 'next/link';
import { useState } from 'react';

import { PLAN_DISPLAY_ORDER, PLAN_METADATA, type PlanTier } from '@meal-planner-demo/constants';
import { DEFAULT_SELECTED_PLAN, PLAN_SIGNUP_ROUTES } from '~/lib/plans';

const SECONDARY_COPY: Record<PlanTier, string> = {
  premium: 'Want to dip your toes first? Switch to Free anytime.',
  basic: 'Ready for full power? Jump to Premium instead.',
};

const SECONDARY_ACTION_LABEL: Record<PlanTier, string> = {
  premium: 'Start free instead',
  basic: 'Upgrade to Premium',
};

export default function PlanSelection() {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(DEFAULT_SELECTED_PLAN);
  const secondaryPlan: PlanTier = selectedPlan === 'premium' ? 'basic' : 'premium';
  const selectedPlanMeta = PLAN_METADATA[selectedPlan];

  return (
    <section id="plan-selector" className="bg-emerald-950 py-16 text-white sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Choose your journey
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Pick your plan before you sign up
        </h2>
        <p className="mt-4 max-w-3xl text-base text-emerald-100 sm:text-lg">
          We highlight Premium by default so you see everything MealMind AI can automate for you.
          You can switch to Free any time — the choice is always yours.
        </p>

        <div
          className="mt-10 grid gap-6 lg:grid-cols-2"
          role="radiogroup"
          aria-label="Plan selection"
        >
          {PLAN_DISPLAY_ORDER.map((tier) => {
            const plan = PLAN_METADATA[tier];
            const isSelected = tier === selectedPlan;
            return (
              <label
                key={tier}
                className={`relative cursor-pointer rounded-2xl border px-6 py-6 text-left shadow-sm transition-all ${
                  isSelected
                    ? 'border-white/80 bg-white/5 shadow-emerald-900/30'
                    : 'border-white/20 bg-white/0 hover:border-white/40'
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={tier}
                  checked={isSelected}
                  onChange={() => setSelectedPlan(tier)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{plan.name}</p>
                    <p className="text-sm text-emerald-100">{plan.description}</p>
                  </div>
                  {plan.badge && (
                    <span className="rounded-full border border-emerald-200/70 bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-50">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm text-emerald-100">{plan.spotlight}</p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-white">{plan.price}</span>
                  {plan.period && <span className="text-base text-emerald-200">{plan.period}</span>}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-emerald-50">
                      <span aria-hidden="true" className="mt-0.5 text-emerald-300">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-px rounded-2xl ring-2 ring-emerald-300"
                  />
                )}
              </label>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href={PLAN_SIGNUP_ROUTES[selectedPlan]}
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-900 shadow-sm transition hover:translate-y-0.5 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          >
            Continue with {selectedPlanMeta.name}
          </Link>
          <div className="rounded-2xl border border-white/20 bg-white/0 px-6 py-4 text-left sm:flex-1">
            <p className="text-sm font-semibold text-white">{SECONDARY_COPY[selectedPlan]}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-emerald-100">
              <Link
                href={PLAN_SIGNUP_ROUTES[secondaryPlan]}
                className="font-semibold text-emerald-200 underline-offset-4 transition hover:text-white"
              >
                {SECONDARY_ACTION_LABEL[selectedPlan]}
              </Link>
              <span aria-hidden="true">•</span>
              <span>No card required for Free. Cancel Premium anytime.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
