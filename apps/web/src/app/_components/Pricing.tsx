// Pricing tiers comparison section
import Link from 'next/link';

export default function Pricing() {
  const tiers = [
    {
      name: 'Free Tier',
      price: '€0',
      description: 'Perfect for getting started with meal planning',
      features: [
        'Weekly meal-prep recipes',
        'Automatic shopping list',
        'Basic dietary preferences',
        'Email support',
      ],
      cta: 'Get Started',
      href: '/auth/signup',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '€4.99',
      period: '/month',
      description: 'For families who want to save time and money',
      features: [
        'Everything in Free',
        'Best value supermarket finder',
        'Advanced customisation',
        'Multiple meal plans',
        'Priority support',
        'Export and share plans',
      ],
      cta: 'Go Premium',
      href: '/auth/signup?tier=premium',
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Choose the plan that works for you
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            Start free and upgrade when you&apos;re ready for more features.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 shadow-sm ${
                tier.highlighted
                  ? 'bg-emerald-50 ring-2 ring-emerald-600'
                  : 'bg-white ring-1 ring-gray-200'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute right-8 top-0 -translate-y-1/2 rounded-full bg-emerald-600 px-4 py-1 text-sm font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{tier.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-gray-900">
                  {tier.price}
                </span>
                {tier.period && <span className="text-base text-gray-600">{tier.period}</span>}
              </div>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-emerald-600">✓</span>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`mt-8 block w-full rounded-full py-3 text-center text-base font-semibold transition-all duration-150 ease-in-out hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.highlighted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:outline-emerald-600'
                    : 'bg-white text-emerald-700 ring-1 ring-emerald-600 hover:bg-emerald-50 focus-visible:outline-emerald-600'
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
