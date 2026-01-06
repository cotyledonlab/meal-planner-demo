import { CalendarDays, ShoppingCart, Euro, Settings, Sparkles } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { SquiggleDivider, BlobShape } from '~/components/ui/decorative';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  Icon: LucideIcon;
  color: 'emerald' | 'coral' | 'honey' | 'lavender';
  premium?: boolean;
  highlight?: string;
}

export function FeatureCards() {
  const features: Feature[] = [
    {
      title: 'No More "What\'s for Dinner?" Panic',
      description:
        'Get a complete 7-day meal plan tailored to your family. Breakfast, lunch, dinner – all sorted.',
      Icon: CalendarDays,
      color: 'emerald',
      highlight: 'Peace of mind, every single day',
    },
    {
      title: 'Shopping Made Stupidly Simple',
      description:
        'Your ingredients, automatically listed and organized by aisle. No more forgotten items.',
      Icon: ShoppingCart,
      color: 'coral',
      highlight: 'One trip. Done.',
    },
    {
      title: 'Save Money Without the Hassle',
      description:
        "We scan supermarket prices so you don't have to. Find the best deals and save €20+ every week.",
      Icon: Euro,
      color: 'honey',
      premium: true,
      highlight: '€1,000+ saved per year',
    },
    {
      title: 'Actually Works for Your Family',
      description:
        'Picky eaters? Dietary restrictions? Set your preferences once, and get meals everyone will eat.',
      Icon: Settings,
      color: 'lavender',
      premium: true,
      highlight: 'Personalised to you',
    },
  ];

  const colorClasses = {
    emerald: {
      icon: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200',
      accent: 'text-emerald-600',
      ring: 'group-hover:ring-emerald-200',
    },
    coral: {
      icon: 'bg-[color:var(--coral-light)] text-[color:var(--coral)] group-hover:bg-[color:var(--coral)] group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-200',
      accent: 'text-[color:var(--coral)]',
      ring: 'group-hover:ring-red-100',
    },
    honey: {
      icon: 'bg-[color:var(--honey-light)] text-[color:var(--honey)] group-hover:bg-[color:var(--honey)] group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-200',
      accent: 'text-[color:var(--honey)]',
      ring: 'group-hover:ring-amber-100',
    },
    lavender: {
      icon: 'bg-[color:var(--lavender-light)] text-[color:var(--lavender)] group-hover:bg-[color:var(--lavender)] group-hover:text-white group-hover:shadow-lg group-hover:shadow-purple-200',
      accent: 'text-[color:var(--lavender)]',
      ring: 'group-hover:ring-purple-100',
    },
  };

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-20 sm:py-28 lg:py-32 overflow-hidden texture-paper">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -right-32 top-20 w-96 h-96 opacity-30">
          <BlobShape variant="primary" />
        </div>
        <div className="absolute -left-32 bottom-20 w-80 h-80 opacity-20">
          <BlobShape variant="secondary" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-4">
            Why families love us
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Everything you need for{' '}
            <span className="relative">
              <span className="relative z-10 text-emerald-600">happier</span>
            </span>{' '}
            mealtimes
          </h2>
          <div className="mx-auto mt-2 w-32">
            <SquiggleDivider className="text-emerald-400" />
          </div>
          <p className="mt-6 text-lg text-gray-600 sm:text-xl leading-relaxed">
            Less stress. Less waste. More time for what matters – your family.
          </p>
        </div>

        {/* Asymmetric grid layout */}
        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            {features.map((feature, index) => {
              // Create asymmetric spans: first two cards larger, last two smaller
              const spanClass = index < 2 ? 'lg:col-span-6' : 'lg:col-span-6';
              // Offset the second row for visual interest
              const offsetClass = index === 2 ? 'lg:col-start-1' : '';

              return (
                <Card
                  key={feature.title}
                  className={cn(
                    'group relative p-8 transition-all duration-300 ease-out',
                    'hover:shadow-xl hover:-translate-y-2',
                    'ring-1 ring-gray-100',
                    colorClasses[feature.color].ring,
                    spanClass,
                    offsetClass,
                    // Stagger animation
                    'animate-reveal-up',
                    index === 0 && 'stagger-1',
                    index === 1 && 'stagger-2',
                    index === 2 && 'stagger-3',
                    index === 3 && 'stagger-4'
                  )}
                >
                  {feature.premium && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm">
                      <Sparkles className="h-3 w-3" />
                      Premium
                    </span>
                  )}

                  <div className="flex items-start gap-5">
                    <div
                      className={cn(
                        'flex-shrink-0 inline-flex rounded-2xl p-4 transition-all duration-300',
                        colorClasses[feature.color].icon
                      )}
                    >
                      <feature.Icon className="h-7 w-7" aria-hidden="true" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
                        {feature.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-gray-600">
                        {feature.description}
                      </p>
                      {feature.highlight && (
                        <p
                          className={cn(
                            'mt-4 text-sm font-bold',
                            colorClasses[feature.color].accent
                          )}
                        >
                          {feature.highlight}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeatureCards;
