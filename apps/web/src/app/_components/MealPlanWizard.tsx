'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface MealPlanWizardProps {
  onComplete: (preferences: MealPreferences) => void;
  onClose?: () => void;
  isPremium?: boolean;
}

export interface MealPreferences {
  householdSize: number;
  mealsPerDay: number;
  days: number;
  isVegetarian: boolean;
  isDairyFree: boolean;
  dislikes: string;
}

export default function MealPlanWizard({
  onComplete,
  onClose,
  isPremium = false,
}: MealPlanWizardProps) {
  const [householdSize, setHouseholdSize] = useState(2);
  const [mealsPerDay, setMealsPerDay] = useState(1);
  const [days, setDays] = useState(isPremium ? 7 : 3);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);
  const [dislikes, setDislikes] = useState('');

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ householdSize, mealsPerDay, days, isVegetarian, isDairyFree, dislikes });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-0 sm:bg-gray-900/50 sm:p-4"
      onClick={() => onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div
        className="flex h-full w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full w-full flex-col overflow-y-auto rounded-none bg-gradient-to-b from-white to-emerald-50/30 p-6 shadow-xl sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl sm:border sm:border-emerald-100/50 sm:p-8">
          {/* Header icon/illustration */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 id="wizard-title" className="text-center text-3xl font-bold text-gray-900">
                Let&apos;s plan your week!
              </h2>
              <p className="mt-3 text-center text-base text-gray-600">
                Answer a few quick questions to get your personalised meal plan.
              </p>
              <p className="mt-1 text-center text-sm text-gray-500">Takes about 10 seconds</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                type="button"
                className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white p-2.5 text-gray-400 shadow-md transition hover:bg-gray-50 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:right-6 sm:top-6"
                aria-label="Close and return to dashboard"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Household size */}
            <div className="group">
              <label
                htmlFor="householdSize"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900"
              >
                <span>How many people?</span>
                <span className="text-sm leading-none sm:text-base" role="img" aria-label="people">
                  👥
                </span>
              </label>
              <div className="relative mt-2">
                <select
                  id="householdSize"
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(Number(e.target.value))}
                  className="block w-full appearance-none rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 pr-12 text-base text-gray-900 shadow-sm transition hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:rounded-xl min-h-[56px]"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Meals per day */}
            <div className="group">
              <label
                htmlFor="mealsPerDay"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900"
              >
                <span>How many meals per day?</span>
                <span className="text-sm leading-none sm:text-base" role="img" aria-label="meals">
                  🍽️
                </span>
              </label>
              <div className="relative mt-2">
                <select
                  id="mealsPerDay"
                  value={mealsPerDay}
                  onChange={(e) => setMealsPerDay(Number(e.target.value))}
                  className="block w-full appearance-none rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 pr-12 text-base text-gray-900 shadow-sm transition hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:rounded-xl min-h-[56px]"
                >
                  <option value={1}>1 meal (Dinner only)</option>
                  <option value={2}>2 meals (Lunch & Dinner)</option>
                  <option value={3}>3 meals (All meals)</option>
                </select>
                <ChevronDownIcon
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* How many days */}
            <div className="group">
              <label
                htmlFor="days"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900"
              >
                <span>How many days to plan?</span>
                <span className="text-sm leading-none sm:text-base" role="img" aria-label="calendar">
                  📅
                </span>
              </label>
              <div className="relative mt-2">
                <select
                  id="days"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="block w-full appearance-none rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 pr-12 text-base text-gray-900 shadow-sm transition hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:rounded-xl min-h-[56px]"
                >
                  {[3, 4, 5, 6, 7].map((num) => {
                    const isPremiumOption = !isPremium && num > 3;
                    return (
                      <option key={num} value={num} disabled={isPremiumOption}>
                        {num} days{isPremiumOption ? ' ⭐ Premium' : ''}
                      </option>
                    );
                  })}
                </select>
                <ChevronDownIcon
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              {!isPremium && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 border border-amber-200">
                  💡 Basic users limited to 3 days. Upgrade to premium for 4-7 day plans.
                </p>
              )}
            </div>

            {/* Diet preferences */}
            <div className="space-y-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span>Dietary preferences</span>
                <span className="text-sm leading-none sm:text-base" role="img" aria-label="diet">
                  🥗
                </span>
              </span>
              <label
                htmlFor="isVegetarian"
                className="flex min-h-[60px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-gray-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/30 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-600 sm:rounded-xl"
              >
                <input
                  type="checkbox"
                  id="isVegetarian"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                  className="h-6 w-6 shrink-0 rounded-md border-2 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-600"
                />
                <span className="flex items-center gap-2">
                  <span>🌱</span>
                  <span>Vegetarian</span>
                </span>
              </label>
              <label
                htmlFor="isDairyFree"
                className="flex min-h-[60px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-gray-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/30 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-600 sm:rounded-xl"
              >
                <input
                  type="checkbox"
                  id="isDairyFree"
                  checked={isDairyFree}
                  onChange={(e) => setIsDairyFree(e.target.checked)}
                  className="h-6 w-6 shrink-0 rounded-md border-2 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-600"
                />
                <span className="flex items-center gap-2">
                  <span>🥛</span>
                  <span>Dairy-free</span>
                </span>
              </label>
            </div>

            {/* Dislikes */}
            <div className="group">
              <label
                htmlFor="dislikes"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900"
              >
                <span>Foods to avoid (optional)</span>
                <span className="text-sm leading-none sm:text-base" role="img" aria-label="avoid">
                  🚫
                </span>
              </label>
              <input
                type="text"
                id="dislikes"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                placeholder="e.g., mushrooms, olives"
                className="mt-2 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 placeholder-gray-400 shadow-sm transition hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:rounded-xl min-h-[56px]"
              />
              <p className="mt-2 text-xs text-gray-500">💬 Separate multiple items with commas</p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full min-h-[56px] rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl hover:shadow-emerald-600/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <span>✨</span>
                <span>Create My Plan</span>
                <span>🎯</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
