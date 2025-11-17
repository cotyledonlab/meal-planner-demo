'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

import PremiumFeatureCard from '~/app/_components/dashboard/PremiumFeatureCard';
import PremiumPreviewModal from '~/app/_components/PremiumPreviewModal';

interface DashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  hasMealPlan: boolean;
}

export default function DashboardClient({ user, hasMealPlan }: DashboardClientProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const isPremiumUser = user.role === 'premium';

  const displayName = user.name ?? user.email?.split('@')[0] ?? 'there';

  const premiumFeatures: Array<{
    id: string;
    title: string;
    description: string;
    Icon: React.ComponentType<React.ComponentProps<'svg'>>;
    color: 'blue' | 'amber' | 'purple' | 'emerald';
  }> = [
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 px-8 py-10 shadow-xl sm:px-12">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
            <div className="relative">
              <h1 className="text-4xl font-bold text-white">Welcome back, {displayName}!</h1>
              <p className="mt-3 text-lg text-emerald-100">
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
            <Link
              href="/planner"
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md transition-transform group-hover:scale-110">
                  <SparklesIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">New Weekly Plan</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Generate a fresh 7-day meal plan tailored to your preferences
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/planner"
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md transition-transform group-hover:scale-110">
                  <CalendarDaysIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Open Planner</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    View and edit your current meal plan and recipes
                  </p>
                </div>
              </div>
            </Link>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 opacity-60 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-300 text-gray-500 shadow-sm">
                  <ShoppingBagIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Shopping List</h3>
                  <p className="mt-1 text-sm text-gray-500">Available after creating a meal plan</p>
                </div>
              </div>
            </div>
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
            {premiumFeatures.map((feature) => (
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
