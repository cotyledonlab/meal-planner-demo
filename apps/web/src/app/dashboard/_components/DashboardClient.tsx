'use client';

import { useState } from 'react';
import Link from 'next/link';

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

  const premiumFeatures = [
    {
      id: 'nutrition',
      title: 'Tailored Nutritional Requirements',
      description: 'Macros and calories tuned to your goals; diabetic- and allergy-aware options.',
      icon: '🎯',
    },
    {
      id: 'price-comparison',
      title: 'Supermarket Price Comparison',
      description: 'See estimated totals across Aldi, Lidl, Tesco & Dunnes to save more.',
      icon: '💰',
    },
    {
      id: 'pantry',
      title: 'Pantry-Aware Substitutions',
      description: 'Auto-skip what you already have and suggest smart swaps.',
      icon: '🏺',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Welcome back, {displayName}!</h1>
          <p className="mt-2 text-lg text-gray-600">Ready to plan your meals for the week?</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/planner"
              className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto"
            >
              <span>🗓️</span>
              {hasMealPlan ? 'Plan meals' : 'Create your first plan'}
            </Link>
            {hasMealPlan && (
              <Link
                href="/planner"
                className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 sm:w-auto"
              >
                View last plan
              </Link>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Quick Actions</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/planner"
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-2xl transition group-hover:scale-110">
                  ✨
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
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-2xl transition group-hover:scale-110">
                  📋
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Open Planner</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    View and edit your current meal plan and recipes
                  </p>
                </div>
              </div>
            </Link>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 opacity-60 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200 text-2xl">
                  🛒
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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Premium Features</h2>
              <p className="mt-1 text-sm text-gray-600">
                {isPremiumUser
                  ? 'Exclusive features available with your Premium subscription'
                  : 'Upgrade to unlock powerful meal planning tools'}
              </p>
            </div>
            {!isPremiumUser && (
              <Link
                href="/#pricing"
                className="hidden text-sm font-semibold text-emerald-600 hover:text-emerald-700 sm:block"
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
                icon={feature.icon}
                isPremiumUser={isPremiumUser}
                onPreview={
                  feature.id === 'price-comparison' ? () => setShowPremiumModal(true) : undefined
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
