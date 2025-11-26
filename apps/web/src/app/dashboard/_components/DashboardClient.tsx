'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AdjustmentsHorizontalIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import PremiumFeatureCard from '~/app/_components/dashboard/PremiumFeatureCard';
import PremiumPreviewModal from '~/app/_components/PremiumPreviewModal';
import EmptyState from '~/app/_components/EmptyState';

type DashboardUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type PremiumFeature = {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<React.ComponentProps<'svg'>>;
  color: 'blue' | 'amber' | 'purple' | 'emerald';
};

type QuickAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  Icon: React.ComponentType<React.ComponentProps<'svg'>>;
  iconGradientClass: string;
  outlineClass: string;
};

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'nutrition',
    title: 'Tailored Nutritional Requirements',
    description: 'Macros and calories tuned to your goals; diabetic- and allergy-aware options.',
    Icon: ChartBarIcon,
    color: 'blue',
  },
  {
    id: 'price-comparison',
    title: 'Supermarket Price Comparison',
    description: 'See estimated totals across Aldi, Lidl, Tesco & Dunnes to save more.',
    Icon: BuildingStorefrontIcon,
    color: 'amber',
  },
  {
    id: 'pantry',
    title: 'Pantry-Aware Substitutions',
    description: 'Auto-skip what you already have and suggest smart swaps.',
    Icon: AdjustmentsHorizontalIcon,
    color: 'purple',
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-plan',
    title: 'New Weekly Plan',
    description: 'Generate a fresh 7-day meal plan tailored to your preferences',
    href: '/planner',
    Icon: SparklesIcon,
    iconGradientClass: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
    outlineClass: 'focus-visible:outline-emerald-600',
  },
  {
    id: 'open-planner',
    title: 'Open Planner',
    description: 'View and edit your current meal plan and recipes',
    href: '/planner',
    Icon: CalendarDaysIcon,
    iconGradientClass: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
    outlineClass: 'focus-visible:outline-blue-600',
  },
];

interface DashboardClientProps {
  user: DashboardUser;
  hasMealPlan: boolean;
}

function getFirstName(user: DashboardUser): string | null {
  if (user.name) return user.name.split(' ')[0];
  if (user.email) return user.email.split('@')[0];
  return null;
}

function getGreetingParts(firstName: string | null, now: Date = new Date()) {
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  const getTimeBasedGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const greetings = ['Welcome back', 'Great to see you', 'Ready to plan', 'Time-based'] as const;
  const selectedGreeting = greetings[dayOfWeek % greetings.length];
  const greetingText =
    selectedGreeting === 'Time-based' ? getTimeBasedGreeting() : selectedGreeting;

  return {
    greeting: greetingText,
    displayName: firstName ? `, ${firstName}` : '',
  };
}

export default function DashboardClient({ user, hasMealPlan }: DashboardClientProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const isPremiumUser = user.role === 'premium';

  const firstName = useMemo(() => getFirstName(user), [user]);

  const { greeting, displayName } = useMemo(() => getGreetingParts(firstName), [firstName]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 px-8 py-10 shadow-xl sm:px-12">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
            <div className="relative">
              <h1 className="text-3xl font-bold leading-tight text-white break-words sm:text-4xl">
                {greeting}
                {displayName}!
              </h1>
              <p className="mt-3 text-base leading-relaxed text-emerald-100 sm:text-lg">
                Ready to plan your meals for the week?
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/planner"
                  className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-emerald-700 shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                >
                  <SparklesIcon className="h-5 w-5" />
                  {hasMealPlan ? 'Plan meals' : 'Create your first plan'}
                </Link>
                {hasMealPlan && (
                  <Link
                    href="/planner"
                    className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                  >
                    View last plan
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Quick Actions</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className={`group rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${action.outlineClass}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${action.iconGradientClass} shadow-md transition-transform group-hover:scale-110`}
                  >
                    <action.Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 sm:text-base">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {!hasMealPlan ? (
              <EmptyState
                icon={<ShoppingBagIcon className="h-8 w-8" />}
                iconColor="blue"
                title="Your shopping list awaits!"
                description="Create your first meal plan to automatically generate a personalized shopping list with all the ingredients you need."
                actionLabel="Create meal plan"
                actionHref="/planner"
                preview={
                  <div className="rounded-xl border border-gray-200 bg-white/50 p-4 text-left">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      Sample shopping list:
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>2 lbs chicken breast</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>1 bunch broccoli</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>3 cups quinoa</span>
                      </div>
                      <p className="mt-3 text-xs italic text-gray-500">
                        Automatically organized by category
                      </p>
                    </div>
                  </div>
                }
                className="h-full"
              />
            ) : (
              <Link
                href="/planner"
                className="group h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md transition-transform group-hover:scale-110">
                    <ShoppingBagIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Shopping List</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 sm:text-base">
                      View your organized shopping list for this week&apos;s meals
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Premium Features Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Premium Features</h2>
              <p className="mt-1 text-base text-gray-600">
                {isPremiumUser
                  ? 'Exclusive features available with your Premium subscription'
                  : 'Upgrade to unlock powerful meal planning tools'}
              </p>
            </div>
            {!isPremiumUser && (
              <Link
                href="/#pricing"
                className="hidden text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 sm:block"
              >
                View plans →
              </Link>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {PREMIUM_FEATURES.map((feature) => (
              <PremiumFeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={<feature.Icon className="h-6 w-6" />}
                iconColor={feature.color}
                isPremiumUser={isPremiumUser}
                onPreview={
                  feature.id === 'price-comparison' ? () => setShowPremiumModal(true) : undefined
                }
                previewLabel={
                  feature.id === 'price-comparison' ? 'View sample price comparison' : undefined
                }
                onLearnMore={() => {
                  // TODO: Add feature-specific learn more pages
                  console.log('Learn more about:', feature.id);
                }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Premium Preview Modal */}
      {showPremiumModal && <PremiumPreviewModal onClose={() => setShowPremiumModal(false)} />}
    </div>
  );
}
