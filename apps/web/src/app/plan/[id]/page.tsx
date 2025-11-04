import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '~/server/auth';
import { api, HydrateClient } from '~/trpc/server';
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

  // Prefetch the shopping list to hydrate tRPC cache
  try {
    await api.shoppingList.getForPlan.prefetch({ planId: id });
  } catch {
    // Shopping list not ready yet - this can happen if it's still being created
    // Component will handle the empty state
  }

  // Ensure startDate is properly converted to Date if it's a string
  const startDate = plan.startDate instanceof Date ? plan.startDate : new Date(plan.startDate);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

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
            <HydrateClient>
              <ShoppingList planId={id} />
            </HydrateClient>
          </div>
        </div>
      </div>
    </main>
  );
}
