'use client';

import { useState } from 'react';

interface MealPlanWizardProps {
  onComplete: (preferences: MealPreferences) => void;
}

export interface MealPreferences {
  people: number;
  days: number;
  mealType: string;
}

export default function MealPlanWizard({ onComplete }: MealPlanWizardProps) {
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(7);
  const [mealType, setMealType] = useState('balanced');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ people, days, mealType });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-900">Let&apos;s plan your week!</h2>
        <p className="mt-2 text-sm text-gray-600">
          Answer a few quick questions to get your personalised meal plan.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* How many people */}
          <div>
            <label htmlFor="people" className="block text-sm font-semibold text-gray-900">
              How many people?
            </label>
            <select
              id="people"
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'person' : 'people'}
                </option>
              ))}
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
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              {[3, 4, 5, 6, 7].map((num) => (
                <option key={num} value={num}>
                  {num} days
                </option>
              ))}
            </select>
          </div>

          {/* Meal type focus */}
          <div>
            <label htmlFor="mealType" className="block text-sm font-semibold text-gray-900">
              Meal type focus
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="balanced">Balanced</option>
              <option value="high-protein">High-Protein</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="family">Family</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full rounded-full bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Create My Plan
          </button>
        </form>
      </div>
    </div>
  );
}
