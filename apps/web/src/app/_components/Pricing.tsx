// Pricing tiers comparison section
import Link from 'next/link';
import { PRICING } from '@meal-planner-demo/constants';

export default function Pricing() {
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
            Choose the plan that works for you
          </h2>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl">
            Start free and upgrade when you&apos;re ready for more features.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          {tiers.map((tier) => (
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
                  {tier.price}
                </span>
                {'period' in tier && tier.period && (
                  <span className="text-lg text-gray-600">{tier.period}</span>
                )}
              </div>
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
                className={`mt-8 block w-full rounded-full py-3.5 text-center text-base font-semibold shadow-md transition-all duration-150 ease-in-out hover:scale-[1.02] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.highlighted
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 focus-visible:outline-emerald-600'
                    : 'bg-white text-emerald-700 ring-2 ring-emerald-600 hover:bg-emerald-50 focus-visible:outline-emerald-600'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Prototype pricing — subject to change.
        </p>
      </div>
    </section>
  );
}
