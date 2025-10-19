import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';

export default async function LastPlanPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get the last meal plan
  const lastPlan = await api.plan.getLast();

  if (!lastPlan) {
    // No plan exists, redirect to planner
    redirect('/planner');
  }

  // Redirect to the specific plan page
  redirect(`/plan/${lastPlan.id}`);
}
