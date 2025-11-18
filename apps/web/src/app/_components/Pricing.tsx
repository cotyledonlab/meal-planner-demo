// Pricing tiers comparison section
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PRICING } from '@meal-planner-demo/constants';

export default function Pricing() {
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
      className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose what works for your family
          </h2>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl">
            Start free – no credit card required. Upgrade anytime for extra peace of mind.
          </p>

          {/* Billing period toggle */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`relative inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Annual
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                Save {PRICING.PREMIUM.annualSavings}
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          {tiers.map((tier) => {
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
                className={`relative rounded-2xl p-8 transition-all duration-200 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 ring-2 ring-emerald-600 shadow-xl hover:shadow-2xl hover:-translate-y-1'
                    : 'bg-white shadow-md ring-1 ring-gray-200 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute right-8 top-0 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-1 text-sm font-semibold text-white shadow-md">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <p className="mt-2 text-base text-gray-600">{tier.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    {displayPrice}
                  </span>
                  {displayPeriod && <span className="text-lg text-gray-600">{displayPeriod}</span>}
                </div>

                {/* Psychological pricing enhancements */}
                {isPremium && (
                  <div className="mt-3 space-y-1.5">
                    {billingPeriod === 'annual' && (
                      <p className="text-sm text-emerald-700 font-medium">
                        Only {PRICING.PREMIUM.annualMonthlyEquivalent}/month billed annually
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {PRICING.PREMIUM.valueProposition} • Just {PRICING.PREMIUM.dailyCost}/day
                    </p>
                    <p className="text-sm font-semibold text-emerald-700">{PRICING.PREMIUM.roi}</p>
                  </div>
                )}

                {/* Value comparison for premium */}
                {isPremium && (
                  <div className="mt-4 rounded-lg bg-white/60 p-3 border border-emerald-200">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      Compare: Meal kit services
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="line-through text-gray-500">
                        {PRICING.VALUE_COMPARISON.mealKitServices}
                      </span>
                      <span className="ml-2 font-semibold text-emerald-700">
                        vs. Only {displayPrice}
                        {displayPeriod}
                      </span>
                    </p>
                  </div>
                )}

                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${tier.highlighted ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}
                      >
                        ✓
                      </span>
                      <span className="text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`mt-8 flex min-h-[48px] w-full items-center justify-center rounded-full py-3.5 text-center text-base font-semibold shadow-md transition-all duration-150 ease-in-out hover:scale-[1.02] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 focus-visible:outline-emerald-600'
                      : 'bg-white text-emerald-700 ring-2 ring-emerald-600 hover:bg-emerald-50 focus-visible:outline-emerald-600'
                  }`}
                >
                  {tier.cta}
                </Link>

                {/* Trust signals for premium */}
                {isPremium && (
                  <div className="mt-4 space-y-1 text-center">
                    <p className="text-xs text-gray-600">
                      ✓ {PRICING.TRUST_SIGNALS.moneyBackGuarantee}
                    </p>
                    <p className="text-xs text-gray-600">✓ {PRICING.TRUST_SIGNALS.cancelAnytime}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Social proof */}
        <div className="mt-10 text-center">
          <p className="text-base font-semibold text-gray-700">{PRICING.PREMIUM.socialProof}</p>
        </div>

        <p className="mt-8 text-center text-sm text-gray-700">
          Prototype pricing — subject to change.
        </p>
      </div>
    </section>
  );
}
