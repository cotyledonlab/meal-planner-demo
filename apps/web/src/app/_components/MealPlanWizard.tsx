'use client';

import { useState, useEffect } from 'react';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-0 sm:p-4"
      onClick={() => onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <div
        className="flex h-full w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full w-full flex-col overflow-y-auto rounded-none bg-white p-6 shadow-xl sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl sm:p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 id="wizard-title" className="text-2xl font-semibold text-gray-900">
                Let&apos;s plan your week!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Answer a few quick questions to get your personalised meal plan.
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                type="button"
                className="ml-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
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
            <div>
              <label htmlFor="householdSize" className="block text-sm font-semibold text-gray-900">
                How many people?
              </label>
              <select
                id="householdSize"
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
            </div>

            {/* Meals per day */}
            <div>
              <label htmlFor="mealsPerDay" className="block text-sm font-semibold text-gray-900">
                How many meals per day?
              </label>
              <select
                id="mealsPerDay"
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(Number(e.target.value))}
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value={1}>1 meal (Dinner only)</option>
                <option value={2}>2 meals (Lunch & Dinner)</option>
                <option value={3}>3 meals (All meals)</option>
              </select>
            </div>

            {/* How many days */}
            <div>
              <label htmlFor="days" className="block text-sm font-semibold text-gray-900">
                How many days to plan?
              </label>
              <select
                id="days"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {[3, 4, 5, 6, 7].map((num) => {
                  const isPremiumOption = !isPremium && num > 3;
                  return (
                    <option key={num} value={num} disabled={isPremiumOption}>
                      {num} days{isPremiumOption ? ' (Premium)' : ''}
                    </option>
                  );
                })}
              </select>
              {!isPremium && (
                <p className="mt-1 text-xs text-amber-600">
                  Basic users are limited to 3 days. Upgrade to premium for 4-7 day plans.
                </p>
              )}
            </div>

            {/* Diet preferences */}
            <div className="space-y-3">
              <span className="block text-sm font-semibold text-gray-900">Dietary preferences</span>
              <label
                htmlFor="isVegetarian"
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-700 shadow-sm transition hover:border-emerald-400 focus-within:border-emerald-500"
              >
                <input
                  type="checkbox"
                  id="isVegetarian"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded-md border-2 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-600 sm:h-4 sm:w-4"
                />
                <span>Vegetarian</span>
              </label>
              <label
                htmlFor="isDairyFree"
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-700 shadow-sm transition hover:border-emerald-400 focus-within:border-emerald-500"
              >
                <input
                  type="checkbox"
                  id="isDairyFree"
                  checked={isDairyFree}
                  onChange={(e) => setIsDairyFree(e.target.checked)}
                  className="h-5 w-5 shrink-0 rounded-md border-2 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-600 sm:h-4 sm:w-4"
                />
                <span>Dairy-free</span>
              </label>
            </div>

            {/* Dislikes */}
            <div>
              <label htmlFor="dislikes" className="block text-sm font-semibold text-gray-900">
                Foods to avoid (optional)
              </label>
              <input
                type="text"
                id="dislikes"
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                placeholder="e.g., mushrooms, olives"
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple items with commas</p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full min-h-[48px] rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Create My Plan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
