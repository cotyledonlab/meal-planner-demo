'use client';

import { useState } from 'react';
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
  Icon: React.ComponentType<React.ComponentProps<'svg'>>;
  iconGradientClass: string;
  outlineClass?: string;
  href?: string;
  isDisabled?: boolean;
};

type GreetingParts = {
  greeting: string;
  displayName: string;
};

const PREMIUM_FEATURES = [
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
] satisfies PremiumFeature[];

const QUICK_ACTIONS = [
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
  {
    id: 'shopping-list',
    title: 'Shopping List',
    description: 'Available after creating a meal plan',
    Icon: ShoppingBagIcon,
    iconGradientClass: 'bg-gray-300 text-gray-500',
    outlineClass: 'focus-visible:outline-gray-400',
    isDisabled: true,
  },
] satisfies QuickAction[];

interface DashboardClientProps {
  user: DashboardUser;
  hasMealPlan: boolean;
}

function getFirstName(user: DashboardUser): string | null {
  if (user.name) return user.name.split(' ')[0];
  if (user.email) return user.email.split('@')[0];
  return null;
}

function getGreetingParts(firstName: string | null, now: Date = new Date()): GreetingParts {
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

  const firstName = getFirstName(user);

  const { greeting, displayName } = getGreetingParts(firstName);

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
            {QUICK_ACTIONS.map((action) => {
              const isDisabled = action.isDisabled;
              const baseClasses =
                'group rounded-2xl border border-gray-200 p-6 shadow-md transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
              const backgroundClasses = isDisabled
                ? 'bg-gradient-to-br from-gray-50 to-gray-100 opacity-60'
                : 'bg-white hover:shadow-xl hover:-translate-y-1';
              const focusClasses = action.outlineClass ?? 'focus-visible:outline-gray-400';
              const iconHoverClasses = isDisabled ? '' : 'group-hover:scale-110';

              const content = (
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${action.iconGradientClass} shadow-md transition-transform ${iconHoverClasses}`}
                  >
                    <action.Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold ${isDisabled ? 'text-gray-700' : 'text-gray-900'}`}
                    >
                      {action.title}
                    </h3>
                    <p
                      className={`mt-1 text-sm leading-relaxed sm:text-base ${isDisabled ? 'text-gray-700' : 'text-gray-600'}`}
                    >
                      {action.description}
                    </p>
                  </div>
                </div>
              );

              if (action.href && !isDisabled) {
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className={`${baseClasses} ${backgroundClasses} ${focusClasses}`}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={action.id}
                  className={`${baseClasses} ${backgroundClasses} ${focusClasses}`}
                  aria-disabled={isDisabled ?? undefined}
                >
                  {content}
                </div>
              );
            })}
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
