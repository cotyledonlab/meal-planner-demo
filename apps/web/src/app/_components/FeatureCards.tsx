// Feature highlights cards section
export default function FeatureCards() {
  const features = [
    {
      title: 'Weekly Meal Plans',
      description:
        'Get a complete 7-day meal plan tailored to your preferences. Breakfast, lunch, and dinner sorted.',
      icon: '📅',
    },
    {
      title: 'Smart Shopping Lists',
      description:
        'Automatically generated shopping lists from your meal plan. Never forget an ingredient again.',
      icon: '🛒',
    },
    {
      title: 'Best Value Finder',
      description:
        'Premium feature: Each week, we scan prices so you buy smart — not more. Find the most cost-effective supermarkets.',
      icon: '💰',
      premium: true,
    },
    {
      title: 'Custom Preferences',
      description:
        'Premium feature: Set dietary restrictions, favourite ingredients, and cuisine preferences for truly personalised plans.',
      icon: '⚙️',
      premium: true,
    },
  ];

  return (
    <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Everything you need for stress-free meal planning
          </h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            Save time, save money, and enjoy delicious home-cooked meals every week.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
            >
              {feature.premium && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Premium
                </span>
              )}
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
