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
                <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
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
