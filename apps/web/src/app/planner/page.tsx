'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import MealPlanWizard, { type MealPreferences } from '~/app/_components/MealPlanWizard';
import { isPremiumUser } from '~/lib/auth';

const LOADING_MESSAGES = [
  '🔍 Finding perfect recipes...',
  '🧮 Calculating nutrition...',
  '🛒 Building your shopping list...',
  '🎨 Creating your meal plan...',
  '✨ Adding the finishing touches...',
];

export default function PlannerPage() {
  const [showWizard, setShowWizard] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isPremium = isPremiumUser(session?.user);

  const generatePlan = api.plan.generate.useMutation({
    onSuccess: (data) => {
      // Show success animation before redirect
      setShowSuccess(true);
      setTimeout(() => {
        if (data?.id) {
          router.push(`/plan/${data.id}`);
        } else {
          console.error('Invalid plan data returned from mutation:', data);
        }
      }, 2500);
    },
    onError: (error) => {
      console.error('Plan generation failed:', error);
    },
  });

  // Rotate loading messages
  useEffect(() => {
    if (!generatePlan.isPending) return;

    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex] ?? LOADING_MESSAGES[0]);
    }, 2000);

    return () => clearInterval(interval);
  }, [generatePlan.isPending]);

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
      {generatePlan.isPending && !showSuccess && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
          <div className="text-center max-w-md px-6">
            {/* Animated spinner with pulse */}
            <div className="relative mb-8 inline-flex items-center justify-center">
              <div className="absolute h-20 w-20 animate-ping rounded-full bg-emerald-400 opacity-20"></div>
              <div className="relative h-16 w-16 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent shadow-lg shadow-emerald-600/30"></div>
            </div>

            {/* Rotating messages */}
            <div className="min-h-[80px]">
              <p className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in">
                {loadingMessage}
              </p>
              <p className="text-sm text-gray-600 animate-fade-in">This takes about 10 seconds</p>
            </div>

            {/* Progress indicator */}
            <div className="mt-6 space-y-2">
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full animate-progress rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {showSuccess && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50">
          <div className="text-center max-w-md px-6">
            {/* Success checkmark with animation */}
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/40 animate-scale-in">
              <svg
                className="h-12 w-12 text-white animate-checkmark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-fade-in">
              🎉 Your plan is ready!
            </h2>
            <p className="text-base text-gray-600 animate-fade-in">Redirecting you now...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {generatePlan.isError && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-6">
          <div className="max-w-md rounded-xl bg-white/90 p-8 text-center shadow-xl ring-1 ring-amber-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-6 w-6 text-amber-700"
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
              We hit a snag generating your plan
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {generatePlan.error?.message ||
                'This is usually temporary. Check your connection and try again in a moment.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  generatePlan.reset();
                  setShowWizard(true);
                }}
                className="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 hover:shadow-md"
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
