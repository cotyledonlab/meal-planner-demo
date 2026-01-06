'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { PRICING } from '@meal-planner-demo/constants';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { SquiggleDivider, BlobShape } from '~/components/ui/decorative';

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const tiers = [
    {
      ...PRICING.FREE,
      cta: 'Get Started',
      href: '/auth/signup',
      highlighted: false,
    },
    {
      ...PRICING.PREMIUM,
      cta: 'Go Premium',
      href: '/auth/signup?tier=premium',
      highlighted: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative bg-gradient-to-b from-white via-gray-50/50 to-gray-50 py-20 sm:py-28 lg:py-32 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -left-40 top-40 w-80 h-80 opacity-20">
          <BlobShape variant="accent" />
        </div>
        <div className="absolute -right-32 bottom-20 w-96 h-96 opacity-15">
          <BlobShape variant="secondary" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4">
            Simple Pricing
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose what works for your family
          </h2>
          <div className="mx-auto mt-2 w-40">
            <SquiggleDivider className="text-[color:var(--honey)]" />
          </div>
          <p className="mt-6 text-lg text-gray-600 sm:text-xl leading-relaxed">
            Start free – no credit card required. Upgrade anytime for extra peace of mind.
          </p>

          {/* Billing period toggle - redesigned */}
          <div className="mt-10 inline-flex items-center gap-1 rounded-full bg-gray-100 p-1.5">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200',
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={cn(
                'relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                billingPeriod === 'annual'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Annual
              <span className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                Save {PRICING.PREMIUM.annualSavings}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards - asymmetric layout */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            {tiers.map((tier, index) => {
              const isPremium = tier.highlighted;
              const displayPrice =
                isPremium && billingPeriod === 'annual' ? PRICING.PREMIUM.annualPrice : tier.price;
              const displayPeriod =
                isPremium && billingPeriod === 'annual'
                  ? PRICING.PREMIUM.annualPeriod
                  : 'period' in tier
                    ? tier.period
                    : undefined;

              return (
                <div
                  key={tier.name}
                  className={cn(
                    'relative overflow-hidden rounded-[2rem] transition-all duration-300 ease-out animate-reveal-up',
                    isPremium
                      ? 'lg:col-span-7 p-8 sm:p-10 bg-gradient-to-br from-emerald-600/10 via-emerald-50 to-amber-50/30 ring-2 ring-emerald-500 shadow-2xl shadow-emerald-200/80 hover:-translate-y-2 hover:shadow-emerald-300/80'
                      : 'lg:col-span-5 p-8 bg-white shadow-lg ring-1 ring-gray-200 hover:-translate-y-1 hover:shadow-xl',
                    index === 0 ? 'stagger-1' : 'stagger-2'
                  )}
                >
                  {isPremium && (
                    <>
                      <span className="absolute right-6 top-0 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-emerald-300/60">
                        <Sparkles className="h-3.5 w-3.5" />
                        Most Popular
                      </span>
                      <div
                        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl"
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-amber-200/50 blur-3xl"
                        aria-hidden="true"
                      />
                    </>
                  )}

                  <h3
                    className={cn(
                      'font-display font-bold text-gray-900',
                      isPremium ? 'text-3xl' : 'text-2xl'
                    )}
                  >
                    {tier.name}
                  </h3>
                  <p className="mt-2 text-base text-gray-600">{tier.description}</p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span
                      className={cn(
                        'font-display font-bold tracking-tight text-gray-900',
                        isPremium ? 'text-6xl' : 'text-5xl'
                      )}
                    >
                      {displayPrice}
                    </span>
                    {displayPeriod && (
                      <span className="text-lg text-gray-500">{displayPeriod}</span>
                    )}
                  </div>

                  {/* Psychological pricing enhancements */}
                  {isPremium && (
                    <div className="mt-4 space-y-2">
                      {billingPeriod === 'annual' && (
                        <p className="text-sm text-emerald-700 font-semibold">
                          Only {PRICING.PREMIUM.annualMonthlyEquivalent}/month billed annually
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {PRICING.PREMIUM.valueProposition} • Just {PRICING.PREMIUM.dailyCost}/day
                      </p>
                      <p className="text-sm font-bold text-emerald-700">{PRICING.PREMIUM.roi}</p>
                    </div>
                  )}

                  {/* Value comparison for premium */}
                  {isPremium && (
                    <div className="mt-5 rounded-2xl bg-white/70 p-4 border border-emerald-200/50 backdrop-blur-sm">
                      <p className="text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                        Compare: Meal kit services
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="line-through text-gray-400">
                          {PRICING.VALUE_COMPARISON.mealKitServices}
                        </span>
                        <span className="ml-2 font-bold text-emerald-700">
                          vs. Only {displayPrice}
                          {displayPeriod}
                        </span>
                      </p>
                    </div>
                  )}

                  <ul className={cn('space-y-3', isPremium ? 'mt-8' : 'mt-6')}>
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className={cn(
                          'flex items-start gap-3 rounded-xl px-3 py-2 transition-all duration-200',
                          isPremium ? 'hover:bg-white/60' : 'hover:bg-gray-50'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                            isPremium
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm'
                              : 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <span className="text-base text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={isPremium ? 'premium' : 'secondary'}
                    size="lg"
                    className={cn('mt-8 w-full group', isPremium && 'shadow-xl')}
                  >
                    <Link href={tier.href}>
                      {tier.cta}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>

                  {/* Trust signals for premium */}
                  {isPremium && (
                    <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        {PRICING.TRUST_SIGNALS.moneyBackGuarantee}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        {PRICING.TRUST_SIGNALS.cancelAnytime}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-12 text-center">
          <p className="text-base font-semibold text-gray-700">{PRICING.PREMIUM.socialProof}</p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Prototype pricing — subject to change.
        </p>
      </div>
    </section>
  );
}

export default Pricing;
