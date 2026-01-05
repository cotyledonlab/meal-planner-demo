'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  // Advanced filters
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
  maxTotalTime?: number | null;
  excludeAllergens?: string[];
}

// Allergen options for exclusion
const ALLERGEN_OPTIONS = [
  { id: 'gluten', label: 'Gluten', emoji: '🌾' },
  { id: 'dairy', label: 'Dairy', emoji: '🧀' },
  { id: 'eggs', label: 'Eggs', emoji: '🥚' },
  { id: 'nuts', label: 'Tree Nuts', emoji: '🥜' },
  { id: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { id: 'soy', label: 'Soy', emoji: '🫘' },
  { id: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'sesame', label: 'Sesame', emoji: '🌱' },
] as const;

// Max cooking time options
const MAX_TIME_OPTIONS = [
  { value: null, label: 'Any time' },
  { value: 15, label: '15 minutes or less' },
  { value: 30, label: '30 minutes or less' },
  { value: 45, label: '45 minutes or less' },
  { value: 60, label: '1 hour or less' },
  { value: 90, label: '90 minutes or less' },
] as const;

// Animation timing constants
const ICON_ANIMATION_DELAY_MS = 50;
const ENCOURAGEMENT_DISPLAY_DURATION_MS = 600;

export function MealPlanWizard({ onComplete, onClose, isPremium = false }: MealPlanWizardProps) {
  const [householdSize, setHouseholdSize] = useState(2);
  const [mealsPerDay, setMealsPerDay] = useState(1);
  const [days, setDays] = useState(isPremium ? 7 : 3);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);
  const [dislikes, setDislikes] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [justChanged, setJustChanged] = useState<string | null>(null);
  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | null>(null);
  const [maxTotalTime, setMaxTotalTime] = useState<number | null>(null);
  const [excludeAllergens, setExcludeAllergens] = useState<string[]>([]);

  // Check if form has any user input (different from defaults)
  const hasUserInput =
    householdSize !== 2 ||
    mealsPerDay !== 1 ||
    days !== (isPremium ? 7 : 3) ||
    isVegetarian ||
    isDairyFree ||
    dislikes.trim().length > 0 ||
    difficulty !== null ||
    maxTotalTime !== null ||
    excludeAllergens.length > 0;

  const handleClose = useCallback(() => {
    if (hasUserInput) {
      setShowConfirmDialog(true);
    } else {
      onClose?.();
    }
  }, [hasUserInput, onClose]);

  const confirmClose = () => {
    setShowConfirmDialog(false);
    onClose?.();
  };

  const cancelClose = () => {
    setShowConfirmDialog(false);
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, handleClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      householdSize,
      mealsPerDay,
      days,
      isVegetarian,
      isDairyFree,
      dislikes,
      difficulty,
      maxTotalTime,
      excludeAllergens,
    });
  };

  // Toggle allergen exclusion
  const toggleAllergen = (allergenId: string) => {
    setExcludeAllergens((prev) =>
      prev.includes(allergenId) ? prev.filter((a) => a !== allergenId) : [...prev, allergenId]
    );
  };

  // Track changes for animations
  const markChanged = (field: string) => {
    setJustChanged(field);
    setTimeout(() => setJustChanged(null), ENCOURAGEMENT_DISPLAY_DURATION_MS);
  };

  // Calculate estimated meals
  const totalMeals = householdSize * mealsPerDay * days;

  // Get encouragement message
  const encouragement = useMemo(() => {
    if (justChanged === 'household' && householdSize > 3) {
      return "Cooking for a crowd! We'll make sure everyone's fed 👨‍👩‍👧‍👦";
    }
    if (justChanged === 'meals' && mealsPerDay === 3) {
      return "Three meals a day! You're taking meal planning seriously 💪";
    }
    if (justChanged === 'days' && days >= 5) {
      return `${days} days planned = less stress, more time for you! ⏰`;
    }
    if (justChanged === 'vegetarian') {
      return 'Plant-based goodness coming right up! 🌿';
    }
    if (justChanged === 'dairy') {
      return 'Dairy-free options included! 🥥';
    }
    return null;
  }, [justChanged, householdSize, mealsPerDay, days]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-0 sm:bg-gray-900/50 sm:p-4"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        <div
          className="flex h-full w-full items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full w-full flex-col overflow-y-auto rounded-none bg-gradient-to-b from-white to-emerald-50/30 shadow-xl sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl sm:border sm:border-emerald-100/50">
            {/* Persistent header with branding */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm">
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                    <path d="M7 2v20" />
                    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                  </svg>
                </div>
                <span className="text-base font-bold text-gray-900 sm:text-lg">MealMind</span>
              </div>
              {onClose && (
                <button
                  onClick={handleClose}
                  type="button"
                  className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  aria-label="Cancel and return to dashboard"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 sm:p-8">
              {/* Progress indicator */}
              <div className="mb-6 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-700">
                  Step 1 of 1
                </p>
                <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-emerald-600"></div>
              </div>

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
                    Tell us about your preferences and we&apos;ll create something special.
                  </p>

                  {/* Visual Preview */}
                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-amber-50 p-4 border-2 border-emerald-100 shadow-sm">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {/* People Icons */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.min(householdSize, 6) }).map((_, i) => (
                          <span
                            key={i}
                            className="text-2xl transition-all duration-300 animate-in zoom-in"
                            style={{ animationDelay: `${i * ICON_ANIMATION_DELAY_MS}ms` }}
                            aria-hidden="true"
                          >
                            👤
                          </span>
                        ))}
                      </div>

                      <span className="text-gray-400">×</span>

                      {/* Meal Icons */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.min(mealsPerDay, 3) }).map((_, i) => (
                          <span
                            key={i}
                            className="text-2xl transition-all duration-300 animate-in zoom-in"
                            style={{ animationDelay: `${i * ICON_ANIMATION_DELAY_MS}ms` }}
                            aria-hidden="true"
                          >
                            🍽️
                          </span>
                        ))}
                      </div>

                      <span className="text-gray-400">×</span>

                      {/* Day Icons */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.min(days, 7) }).map((_, i) => (
                          <span
                            key={i}
                            className="text-2xl transition-all duration-300 animate-in zoom-in"
                            style={{ animationDelay: `${i * ICON_ANIMATION_DELAY_MS}ms` }}
                            aria-hidden="true"
                          >
                            📅
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Preview Text */}
                    <p className="mt-3 text-center text-sm font-medium text-gray-700">
                      Your <span className="text-emerald-700 font-bold">{days}-day plan</span> for{' '}
                      <span className="text-emerald-700 font-bold">
                        {householdSize} {householdSize === 1 ? 'person' : 'people'}
                      </span>{' '}
                      will include{' '}
                      <span className="text-emerald-700 font-bold">{totalMeals} meals</span>
                      {(isVegetarian || isDairyFree) && (
                        <>
                          {' '}
                          —{' '}
                          {[isVegetarian && 'vegetarian', isDairyFree && 'dairy-free']
                            .filter(Boolean)
                            .join(' & ')}
                        </>
                      )}
                    </p>

                    <p className="mt-2 text-center text-xs text-gray-600">
                      ⚡ Plan ready in ~30 seconds
                    </p>
                  </div>

                  {/* Encouragement Message */}
                  {encouragement && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-center text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg px-4 py-2 border border-emerald-200">
                        {encouragement}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Household size */}
                <div className="group">
                  <label
                    htmlFor="householdSize"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                  >
                    <span>Who&apos;s joining you for meals?</span>
                    <span
                      className="text-sm leading-none sm:text-base"
                      role="img"
                      aria-label="people"
                    >
                      👥
                    </span>
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="householdSize"
                      value={householdSize}
                      onChange={(e) => {
                        setHouseholdSize(Number(e.target.value));
                        markChanged('household');
                      }}
                      className="block w-full appearance-none rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 pr-12 text-base text-gray-900 shadow-sm transition hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:rounded-xl min-h-[56px]"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'person' : 'people'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600"
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
                    <span>How often do you want to cook?</span>
                    <span
                      className="text-sm leading-none sm:text-base"
                      role="img"
                      aria-label="meals"
                    >
                      🍽️
                    </span>
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="mealsPerDay"
                      value={mealsPerDay}
                      onChange={(e) => {
                        setMealsPerDay(Number(e.target.value));
                        markChanged('meals');
                      }}
                      className="block w-full appearance-none rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 pr-12 text-base text-gray-900 shadow-sm transition hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:rounded-xl min-h-[56px]"
                    >
                      <option value={1}>1 meal (Dinner only)</option>
                      <option value={2}>2 meals (Lunch & Dinner)</option>
                      <option value={3}>3 meals (All meals)</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600"
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
                    <span>How far ahead should we plan?</span>
                    <span
                      className="text-sm leading-none sm:text-base"
                      role="img"
                      aria-label="calendar"
                    >
                      📅
                    </span>
                  </label>
                  <div className="relative mt-2">
                    <select
                      id="days"
                      value={days}
                      onChange={(e) => {
                        setDays(Number(e.target.value));
                        markChanged('days');
                      }}
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
                    <ChevronDown
                      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600"
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
                    <span
                      className="text-sm leading-none sm:text-base"
                      role="img"
                      aria-label="diet"
                    >
                      🥗
                    </span>
                  </span>
                  <label
                    htmlFor="isVegetarian"
                    className="flex min-h-[60px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-gray-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/30 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-600 sm:rounded-xl active:scale-[0.98]"
                  >
                    <input
                      type="checkbox"
                      id="isVegetarian"
                      checked={isVegetarian}
                      onChange={(e) => {
                        setIsVegetarian(e.target.checked);
                        if (e.target.checked) markChanged('vegetarian');
                      }}
                      className="h-7 w-7 shrink-0 rounded-md border-2 border-gray-300 text-emerald-600 transition-all focus:ring-2 focus:ring-emerald-600 checked:bg-emerald-600 checked:border-emerald-600 active:scale-90"
                    />
                    <span className="flex items-center gap-2">
                      <span>🌱</span>
                      <span>Vegetarian</span>
                    </span>
                  </label>
                  <label
                    htmlFor="isDairyFree"
                    className="flex min-h-[60px] cursor-pointer items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-gray-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50/30 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-600 sm:rounded-xl active:scale-[0.98]"
                  >
                    <input
                      type="checkbox"
                      id="isDairyFree"
                      checked={isDairyFree}
                      onChange={(e) => {
                        setIsDairyFree(e.target.checked);
                        if (e.target.checked) markChanged('dairy');
                      }}
                      className="h-7 w-7 shrink-0 rounded-md border-2 border-gray-300 text-emerald-600 transition-all focus:ring-2 focus:ring-emerald-600 checked:bg-emerald-600 checked:border-emerald-600 active:scale-90"
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
                    <span>Anything you&apos;d rather skip? (optional)</span>
                    <span
                      className="text-sm leading-none sm:text-base"
                      role="img"
                      aria-label="avoid"
                    >
                      🚫
                    </span>
                  </label>
                  <input
                    type="text"
                    id="dislikes"
                    value={dislikes}
                    onChange={(e) => setDislikes(e.target.value)}
                    placeholder="e.g., mushrooms, olives, cilantro"
                    className="mt-2 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 text-base text-gray-900 placeholder-gray-600 shadow-sm transition hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:rounded-xl min-h-[56px]"
                  />
                  <p className="mt-2 text-xs text-gray-700">
                    💬 Separate multiple items with commas
                  </p>
                </div>

                {/* Advanced Options (Collapsible) */}
                <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-50"
                    aria-expanded={showAdvancedFilters}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span>⚙️</span>
                      <span>Advanced Options</span>
                      {(difficulty !== null ||
                        maxTotalTime !== null ||
                        excludeAllergens.length > 0) && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {[
                            difficulty && '1',
                            maxTotalTime && '1',
                            excludeAllergens.length > 0 && excludeAllergens.length.toString(),
                          ]
                            .filter(Boolean)
                            .reduce((a, b) => String(Number(a) + Number(b)), '0')}{' '}
                          active
                        </span>
                      )}
                    </span>
                    {showAdvancedFilters ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {showAdvancedFilters && (
                    <div className="border-t border-gray-200 px-4 py-4 space-y-5">
                      {/* Difficulty */}
                      <div className="group">
                        <label
                          htmlFor="difficulty"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                        >
                          <span>Recipe difficulty</span>
                          <span
                            className="text-sm leading-none sm:text-base"
                            role="img"
                            aria-label="difficulty"
                          >
                            📊
                          </span>
                        </label>
                        <div className="relative mt-2">
                          <select
                            id="difficulty"
                            value={difficulty ?? ''}
                            onChange={(e) =>
                              setDifficulty(
                                e.target.value === ''
                                  ? null
                                  : (e.target.value as 'EASY' | 'MEDIUM' | 'HARD')
                              )
                            }
                            className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          >
                            <option value="">Any difficulty</option>
                            <option value="EASY">Easy - Quick & simple</option>
                            <option value="MEDIUM">Medium - Some skill needed</option>
                            <option value="HARD">Hard - For experienced cooks</option>
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600"
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      {/* Max Cooking Time */}
                      <div className="group">
                        <label
                          htmlFor="maxTotalTime"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                        >
                          <span>Maximum cooking time</span>
                          <span
                            className="text-sm leading-none sm:text-base"
                            role="img"
                            aria-label="time"
                          >
                            ⏱️
                          </span>
                        </label>
                        <div className="relative mt-2">
                          <select
                            id="maxTotalTime"
                            value={maxTotalTime ?? ''}
                            onChange={(e) =>
                              setMaxTotalTime(e.target.value === '' ? null : Number(e.target.value))
                            }
                            className="block w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition hover:border-emerald-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          >
                            {MAX_TIME_OPTIONS.map((option) => (
                              <option key={option.label} value={option.value ?? ''}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600"
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      {/* Allergen Exclusions */}
                      <div className="group">
                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <span>Exclude allergens</span>
                          <span
                            className="text-sm leading-none sm:text-base"
                            role="img"
                            aria-label="allergens"
                          >
                            ⚠️
                          </span>
                        </span>
                        <p className="mt-1 text-xs text-gray-600">
                          Select any allergens to exclude from your meal plan
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {ALLERGEN_OPTIONS.map((allergen) => (
                            <label
                              key={allergen.id}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition ${
                                excludeAllergens.includes(allergen.id)
                                  ? 'border-red-400 bg-red-50 text-red-700'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={excludeAllergens.includes(allergen.id)}
                                onChange={() => toggleAllergen(allergen.id)}
                                className="sr-only"
                              />
                              <span>{allergen.emoji}</span>
                              <span>{allergen.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={cancelClose}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            role="alertdialog"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900">
              Discard changes?
            </h3>
            <p id="confirm-dialog-description" className="mt-2 text-sm text-gray-600">
              You have unsaved changes. Are you sure you want to cancel?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={cancelClose}
                className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmClose}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Default export for backward compatibility
export default MealPlanWizard;
