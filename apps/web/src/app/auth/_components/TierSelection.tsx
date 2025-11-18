'use client';

import { useState } from 'react';
import { PRICING } from '@meal-planner-demo/constants';

interface TierSelectionProps {
  selectedTier: 'basic' | 'premium';
  onTierSelect: (tier: 'basic' | 'premium') => void;
}

export default function TierSelection({ selectedTier, onTierSelect }: TierSelectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const tiers = [
    {
      id: 'premium' as const,
      ...PRICING.PREMIUM,
      recommended: true,
    },
    {
      id: 'basic' as const,
      ...PRICING.FREE,
      recommended: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Choose your plan</h2>
        <p className="mt-1 text-sm text-gray-600">Select the plan that best fits your needs</p>
      </div>

      {/* Billing period toggle for premium */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
            billingPeriod === 'monthly'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod('annual')}
          className={`relative rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
            billingPeriod === 'annual'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Annual
          <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
            Save {PRICING.PREMIUM.annualSavings}
          </span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tiers.map((tier) => {
          const isPremium = tier.id === 'premium';
          const displayPrice =
            isPremium && billingPeriod === 'annual' ? PRICING.PREMIUM.annualPrice : tier.price;
          const displayPeriod =
            isPremium && billingPeriod === 'annual'
              ? PRICING.PREMIUM.annualPeriod
              : 'period' in tier
                ? tier.period
                : undefined;

          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onTierSelect(tier.id)}
              className={`relative rounded-xl border-2 p-6 text-left transition-all duration-200 ${
                selectedTier === tier.id
                  ? 'border-emerald-600 bg-emerald-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-sm'
              }`}
            >
              {tier.recommended && (
                <span className="absolute right-4 top-0 -translate-y-1/2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  Recommended
                </span>
              )}

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{displayPrice}</span>
                  {displayPeriod && <span className="text-sm text-gray-600">{displayPeriod}</span>}
                </div>

                {/* Psychological pricing enhancements */}
                {isPremium && (
                  <div className="mt-2 space-y-0.5">
                    {billingPeriod === 'annual' && (
                      <p className="text-xs text-emerald-700 font-medium">
                        {PRICING.PREMIUM.annualMonthlyEquivalent}/month billed annually
                      </p>
                    )}
                    <p className="text-xs text-gray-600">{PRICING.PREMIUM.valueProposition}</p>
                    <p className="text-xs font-semibold text-emerald-700">
                      Just {PRICING.PREMIUM.dailyCost}/day
                    </p>
                  </div>
                )}

                <h3 className="mt-2 text-lg font-semibold text-gray-900">{tier.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{tier.description}</p>
              </div>

              {/* Value comparison for premium */}
              {isPremium && (
                <div className="mb-3 rounded-md bg-emerald-50 border border-emerald-200 p-2">
                  <p className="text-xs text-gray-600">
                    Meal kits:{' '}
                    <span className="line-through">{PRICING.VALUE_COMPARISON.mealKitServices}</span>
                  </p>
                  <p className="text-xs font-semibold text-emerald-700">
                    {PRICING.VALUE_COMPARISON.grocerySavings}
                  </p>
                </div>
              )}

              <ul className="space-y-2">
                {tier.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-emerald-600">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.features.length > 4 && (
                  <li className="text-sm text-gray-500">
                    + {tier.features.length - 4} more features
                  </li>
                )}
              </ul>

              {selectedTier === tier.id && (
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedTier === 'premium' && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm space-y-2">
          <p className="font-semibold text-emerald-900">
            💳 Payment details will be collected in the next step
          </p>
          <p className="text-emerald-800">
            This is a demo app — no real charges will be made. Premium access is granted immediately
            for testing purposes.
          </p>
          <div className="pt-2 border-t border-emerald-200 space-y-1">
            <p className="text-xs text-emerald-700">✓ {PRICING.TRUST_SIGNALS.moneyBackGuarantee}</p>
            <p className="text-xs text-emerald-700">✓ {PRICING.TRUST_SIGNALS.cancelAnytime}</p>
          </div>
        </div>
      )}
    </div>
  );
}
