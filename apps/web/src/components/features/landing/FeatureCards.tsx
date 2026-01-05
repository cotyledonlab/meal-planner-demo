import { CalendarDays, ShoppingCart, Euro, Settings, Lock } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  Icon: LucideIcon;
  color: 'emerald' | 'blue' | 'amber' | 'purple';
  premium?: boolean;
}

export function FeatureCards() {
  const features: Feature[] = [
    {
      title: 'No More "What\'s for Dinner?" Panic',
      description:
        'Get a complete 7-day meal plan tailored to your family. Breakfast, lunch, dinner – all sorted. Finally, peace of mind.',
      Icon: CalendarDays,
      color: 'emerald',
    },
    {
      title: 'Shopping Made Stupidly Simple',
      description:
        'Your ingredients, automatically listed and organized by aisle. No more forgotten items, no more extra trips to the shop.',
      Icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Save Money Without the Hassle',
      description:
        "Premium: We scan supermarket prices so you don't have to. Find the best deals and save €20+ every week – that's over €1,000 a year.",
      Icon: Euro,
      color: 'amber',
      premium: true,
    },
    {
      title: 'Actually Works for Your Family',
      description:
        'Premium: Picky eaters? Dietary restrictions? Favorite ingredients? Set your preferences once, and get meals your family will actually eat.',
      Icon: Settings,
      color: 'purple',
      premium: true,
    },
  ];

  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    amber: 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
    purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for happier mealtimes
          </h2>
          <p className="mt-4 text-lg text-gray-600 sm:text-xl">
            Less stress. Less waste. More time for what matters – your family.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative p-6 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01]"
            >
              {feature.premium && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <Lock className="h-3 w-3" />
                  Premium
                </span>
              )}
              <div
                className={cn(
                  'inline-flex rounded-xl p-3 transition-all duration-200',
                  colorClasses[feature.color]
                )}
              >
                <feature.Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureCards;
