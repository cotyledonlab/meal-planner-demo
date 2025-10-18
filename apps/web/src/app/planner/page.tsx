'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import MealPlanWizard, { type MealPreferences } from '~/app/_components/MealPlanWizard';
import PremiumPreviewModal from '~/app/_components/PremiumPreviewModal';
import Image from 'next/image';

type Step = 'wizard' | 'plan' | 'shopping';

export default function PlannerPage() {
  const [step, setStep] = useState<Step>('wizard');
  const [mealPlanId, setMealPlanId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<MealPreferences | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const generateMealPlan = api.mealPlan.generate.useMutation({
    onSuccess: (data) => {
      setMealPlanId(data.id);
      setStep('plan');
    },
  });

  const { data: mealPlan } = api.mealPlan.getCurrent.useQuery(undefined, {
    enabled: step === 'plan' && mealPlanId !== null,
  });

  const { data: shoppingList } = api.shoppingList.getForMealPlan.useQuery(
    { mealPlanId: mealPlanId! },
    { enabled: step === 'shopping' && mealPlanId !== null }
  );

  const handleWizardComplete = (prefs: MealPreferences) => {
    setPreferences(prefs);
    generateMealPlan.mutate(prefs);
  };

  const handleViewShoppingList = () => {
    setStep('shopping');
  };

  const handleComparePrices = () => {
    setShowPremiumModal(true);
  };

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const handleExportCSV = () => {
    if (!mealPlanId) return;
    
    // Trigger CSV download
    const url = `/api/trpc/shoppingList.exportCSV?input=${encodeURIComponent(JSON.stringify({ mealPlanId }))}`;
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen">
      {/* Wizard Step */}
      {step === 'wizard' && <MealPlanWizard onComplete={handleWizardComplete} />}

      {/* Loading State */}
      {generateMealPlan.isPending && (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            <p className="text-lg font-semibold text-gray-900">Creating your meal plan...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {generateMealPlan.isError && (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
          <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
            <p className="text-lg font-semibold text-red-600">Failed to generate meal plan</p>
            <p className="mt-2 text-sm text-gray-600">{generateMealPlan.error.message}</p>
            <button
              onClick={() => setStep('wizard')}
              className="mt-6 rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Meal Plan View */}
      {step === 'plan' && mealPlan && preferences && (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-6">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
                Your Weekly Meal Plan
              </h1>
              <p className="mt-2 text-base text-gray-600">
                {preferences.days} days · {preferences.mealsPerDay}{' '}
                {preferences.mealsPerDay === 1 ? 'meal' : 'meals'}/day · {preferences.householdSize}{' '}
                {preferences.householdSize === 1 ? 'person' : 'people'}
              </p>
              <div className="mt-4 inline-flex flex-wrap items-center gap-2">
                {preferences.isVegetarian && (
                  <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                    🌱 Vegetarian
                  </span>
                )}
                {preferences.isDairyFree && (
                  <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                    🥛 Dairy-free
                  </span>
                )}
              </div>
            </div>

            {/* Recipe grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mealPlan.items.map((item) => (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-md"
                >
                  {/* Recipe image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                    {item.recipe.imageUrl && (
                      <Image
                        src={item.recipe.imageUrl}
                        alt={item.recipe.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                      />
                    )}
                    {/* Day badge */}
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur-sm">
                      Day {item.dayIndex + 1} · {item.mealType}
                    </div>
                  </div>

                  {/* Recipe details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item.recipe.title}</h3>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{item.recipe.minutes} min</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🔥</span>
                        <span>{item.recipe.calories} kcal</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <div className="mt-12 text-center">
              <button
                onClick={handleViewShoppingList}
                className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                View Shopping List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping List */}
      {step === 'shopping' && shoppingList && (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-5xl px-6">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
                Your Shopping List
              </h1>
              <p className="mt-2 text-base text-gray-600">
                {shoppingList.totalItems} items for your meal plan
              </p>
            </div>

            {/* Shopping list by category */}
            <div className="space-y-6">
              {Object.entries(shoppingList.grouped).map(([category, items]) => (
                <div
                  key={category}
                  className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
                >
                  <h2 className="text-lg font-semibold capitalize text-gray-900">{category}</h2>
                  <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                      <li key={item.ingredientId} className="flex items-center gap-3">
                        <span className="h-5 w-5 flex-shrink-0 text-emerald-600">✓</span>
                        <span className="flex-1 text-sm text-gray-700">
                          {item.ingredientName} - {item.formattedQuantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Price comparison */}
            {shoppingList.cheapestStore && (
              <div className="mt-8 rounded-xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
                <h2 className="text-lg font-semibold text-gray-900">Price Estimate</h2>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  €{shoppingList.cheapestStore.totalPrice.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Estimated total at {shoppingList.cheapestStore.store}
                </p>
                <div className="mt-4 space-y-2">
                  {shoppingList.storePrices.map((store) => (
                    <div key={store.store} className="flex justify-between text-sm">
                      <span className="text-gray-700">{store.store}</span>
                      <span className="font-semibold text-gray-900">
                        €{store.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-12 flex justify-center gap-4">
              <button
                onClick={handleExportCSV}
                className="rounded-full border border-gray-300 bg-white px-8 py-3 text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
              >
                Export CSV
              </button>
              <button
                onClick={handleComparePrices}
                className="rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Compare Prices (Premium)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Preview Modal */}
      {showPremiumModal && <PremiumPreviewModal onClose={handleClosePremiumModal} />}
    </main>
  );
}
