'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import MealPlanWizard, { type MealPreferences } from '~/app/_components/MealPlanWizard';
import { isPremiumUser } from '~/lib/auth';

export default function PlannerPage() {
  const [showWizard, setShowWizard] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const isPremium = isPremiumUser(session?.user);

  const generatePlan = api.plan.generate.useMutation({
    onSuccess: (data) => {
      // Redirect to the plan page
      if (data?.id) {
        router.push(`/plan/${data.id}`);
      } else {
        console.error('Invalid plan data returned from mutation:', data);
      }
    },
    onError: (error) => {
      console.error('Plan generation failed:', error);
    },
  });

  const handleWizardComplete = (preferences: MealPreferences) => {
    setShowWizard(false);
    generatePlan.mutate({
      startDate: new Date(),
      days: preferences.days,
      mealsPerDay: preferences.mealsPerDay,
      householdSize: preferences.householdSize,
      isVegetarian: preferences.isVegetarian,
      isDairyFree: preferences.isDairyFree,
      dislikes: preferences.dislikes,
    });
  };

  const handleWizardClose = () => {
    // Navigate back to home or dashboard
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen">
      {/* Wizard */}
      {showWizard && (
        <MealPlanWizard
          onComplete={handleWizardComplete}
          onClose={handleWizardClose}
          isPremium={isPremium}
        />
      )}

      {/* Loading State */}
      {generatePlan.isPending && (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            <p className="text-lg font-semibold text-gray-900">Creating your meal plan...</p>
            <p className="mt-2 text-sm text-gray-600">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {generatePlan.isError && (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
          <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg ring-1 ring-gray-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Failed to generate meal plan
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {generatePlan.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  generatePlan.reset();
                  setShowWizard(true);
                }}
                className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
