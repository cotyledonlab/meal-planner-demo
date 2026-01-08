import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import PrintAutoTrigger from '~/app/_components/PrintAutoTrigger';
import {
  buildPlanDateMetadata,
  formatIngredientForExport,
  getInstructionsFromRecipe,
  getMealTypeLabel,
  groupPlanByDay,
  hasDietTagInExport,
  normalizeMealPlanForExport,
} from '~/lib/export/plan';
import { DEFAULT_ESTIMATE_MODE, ESTIMATE_DISCLAIMER } from '~/lib/estimate';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanPrintPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const plan = await api.plan.getById({ planId: id }).catch((error) => {
    console.error('Failed to load meal plan for print view', error);
    return null;
  });

  if (!plan) {
    notFound();
  }

  const normalizedPlan = normalizeMealPlanForExport(plan);
  const days = groupPlanByDay(normalizedPlan);
  const { label } = buildPlanDateMetadata(normalizedPlan.startDate, normalizedPlan.days);

  const shoppingList = await api.shoppingList.getForPlan({ planId: id }).catch(() => null);
  const estimateMode = DEFAULT_ESTIMATE_MODE;
  const estimateGeneratedAt = new Date();
  const budgetEstimate = shoppingList?.budgetEstimate;
  const isEstimateLocked = budgetEstimate?.locked !== false;
  const estimateTotal = isEstimateLocked ? null : (budgetEstimate?.totals?.[estimateMode] ?? null);
  const estimateConfidence = isEstimateLocked ? null : (budgetEstimate?.confidence ?? null);
  const estimateMissingItems = isEstimateLocked ? null : (budgetEstimate?.missingItemCount ?? null);
  const estimateModeLabel = `${estimateMode.charAt(0).toUpperCase()}${estimateMode.slice(1)}`;
  const estimateGeneratedLabel = estimateGeneratedAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const estimateConfidenceLabel = estimateConfidence
    ? `${estimateConfidence.charAt(0).toUpperCase()}${estimateConfidence.slice(1)}`
    : null;

  const shoppingListByCategory = shoppingList
    ? Array.from(
        shoppingList.items.reduce((acc, item) => {
          const category = item.category || 'other';
          if (!acc.has(category)) {
            acc.set(category, [] as typeof shoppingList.items);
          }
          acc.get(category)!.push(item);
          return acc;
        }, new Map<string, typeof shoppingList.items>())
      ).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-gray-900 sm:px-8 print:px-6">
      <PrintAutoTrigger />
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-3 border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-emerald-700">Meal Plan</h1>
              <p className="text-gray-600">
                {normalizedPlan.days}-day plan · {label}
              </p>
              {session.user?.name && (
                <p className="text-gray-700">Prepared for {session.user.name}</p>
              )}
            </div>
            <div className="no-print text-right">
              <p className="text-sm text-gray-700">Printing tips</p>
              <p className="text-xs text-gray-700">
                Use &quot;Fit to width&quot; and disable headers/footers for best results.
              </p>
            </div>
          </div>
          <div className="no-print">
            <Link
              href={`/plan/${id}`}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              ← Back to interactive view
            </Link>
          </div>
        </header>

        <section className="space-y-8">
          {days.map((day) => (
            <article
              key={day.dayIndex}
              className="break-inside-avoid rounded-2xl border border-gray-200 bg-white p-6 shadow-sm print:shadow-none"
            >
              <h2 className="text-xl font-semibold text-emerald-700">
                Day {day.dayIndex + 1} ·{' '}
                {day.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <div className="mt-4 space-y-6">
                {day.items.map((item) => {
                  const recipe = item.recipe;
                  const ingredientLines = recipe.ingredients.map((ingredient) =>
                    formatIngredientForExport(ingredient.quantity, ingredient.unit, ingredient.name)
                  );
                  const instructionSteps = getInstructionsFromRecipe(recipe, 8);
                  const isVegetarian = hasDietTagInExport(recipe, 'vegetarian');
                  const isDairyFree = hasDietTagInExport(recipe, 'dairy-free');

                  return (
                    <div key={item.id} className="rounded-xl border border-gray-200 p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{recipe.title}</h3>
                        <p className="text-sm font-medium text-gray-700">
                          {getMealTypeLabel(item.mealType)} · Serves {item.servings}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>⏱️ {recipe.totalTimeMinutes} min</span>
                        <span>🔥 {recipe.calories} kcal</span>
                        {isVegetarian && <span>🌱 Vegetarian</span>}
                        {isDairyFree && <span>🥛 Dairy-Free</span>}
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                            Ingredients
                          </h4>
                          <ul className="mt-2 space-y-1 text-sm">
                            {ingredientLines.map((line, idx) => (
                              <li key={`${item.id}-ing-${idx}`} className="flex gap-2">
                                <span className="text-emerald-600">•</span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                            Steps
                          </h4>
                          <ol className="mt-2 space-y-2 text-sm leading-relaxed">
                            {instructionSteps.map((step, idx) => (
                              <li key={`${item.id}-step-${idx}`} className="flex gap-2">
                                <span className="font-semibold text-emerald-600">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </section>

        {shoppingListByCategory.length > 0 && (
          <section className="break-before-page rounded-2xl border border-gray-200 bg-white p-6 shadow-sm print:shadow-none">
            <h2 className="text-2xl font-semibold text-emerald-700">Shopping List</h2>
            <p className="text-sm text-gray-700">
              Organised by category to speed up your grocery run.
            </p>
            {shoppingList && (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold text-gray-900">Budget estimate</h3>
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {isEstimateLocked ? 'Premium required' : 'Premium estimate'}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold">Mode:</span> {estimateModeLabel}
                  </p>
                  <p>
                    <span className="font-semibold">Generated:</span> {estimateGeneratedLabel}
                  </p>
                  <p>
                    <span className="font-semibold">Total:</span>{' '}
                    {estimateTotal != null ? `€${estimateTotal.toFixed(2)}` : '—'}
                  </p>
                  <p>
                    <span className="font-semibold">Confidence:</span>{' '}
                    {estimateConfidenceLabel ?? '—'}
                  </p>
                  <p>
                    <span className="font-semibold">Missing items:</span>{' '}
                    {estimateMissingItems ?? '—'}
                  </p>
                </div>
                <p className="mt-2 text-xs text-gray-600">{ESTIMATE_DISCLAIMER}</p>
              </div>
            )}
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {shoppingListByCategory.map(([category, items]) => (
                <div key={category} className="space-y-2 rounded-xl border border-gray-100 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    {category}
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {items.map((item) => (
                      <li key={item.id} className="flex gap-2">
                        <span className="text-emerald-600">•</span>
                        <span>
                          {formatIngredientForExport(item.quantity, item.unit, item.name)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
