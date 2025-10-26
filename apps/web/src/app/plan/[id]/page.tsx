import { notFound, redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';
import MealPlanView from '~/app/_components/MealPlanView';
import ShoppingList from '~/app/_components/ShoppingList';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Fetch the meal plan
  const plan = await api.plan.getById({ planId: id }).catch((error) => {
    console.error('Failed to fetch meal plan:', error);
    return null;
  });

  if (!plan) {
    notFound();
  }

  // Fetch the shopping list (may fail if not ready yet, provide fallback)
  let shoppingList = null;
  try {
    shoppingList = await api.shoppingList.getForPlan({ planId: id });
  } catch {
    // Shopping list not ready yet - this can happen if it's still being created
    // We'll render the meal plan and show an empty shopping list
    // Keep shoppingList as null and handle in the component
  }

  // Ensure startDate is properly converted to Date if it's a string
  const startDate = plan.startDate instanceof Date ? plan.startDate : new Date(plan.startDate);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Meal Plan</h1>
          <p className="mt-2 text-sm text-gray-600">
            {plan.days}-day plan starting{' '}
            {startDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Meal Plan */}
          <div className="lg:col-span-2">
            <MealPlanView plan={plan} />
          </div>

          {/* Shopping List */}
          <div className="lg:col-span-1">
            <ShoppingList items={shoppingList?.items} planId={id} />
          </div>
        </div>
      </div>
    </main>
  );
}
