import { redirect } from 'next/navigation';

import { auth } from '~/server/auth';
import { api } from '~/trpc/server';
import { isPremiumUser } from '~/lib/auth';
import { type InitialPreferences } from '~/components/features/meal-plan';
import PlannerPageClient from './_components/PlannerPageClient';

export default async function PlannerPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/planner');
  }

  const isPremium = isPremiumUser(session.user);

  // Fetch user preferences on the server
  let initialPreferences: InitialPreferences | undefined;
  try {
    const savedPreferences = await api.preferences.get();
    if (savedPreferences) {
      initialPreferences = {
        householdSize: savedPreferences.householdSize,
        mealsPerDay: savedPreferences.mealsPerDay,
        // Clamp days to max 3 for non-premium users
        days: isPremium ? savedPreferences.days : Math.min(savedPreferences.days, 3),
        isVegetarian: savedPreferences.isVegetarian,
        isDairyFree: savedPreferences.isDairyFree,
        dislikes: savedPreferences.dislikes ?? '',
        weeknightMaxTimeMinutes: savedPreferences.weeknightMaxTimeMinutes ?? null,
        weeklyTimeBudgetMinutes: savedPreferences.weeklyTimeBudgetMinutes ?? null,
        prioritizeWeeknights: savedPreferences.prioritizeWeeknights ?? true,
      };
    }
  } catch {
    // Preferences not found - user will start with defaults
  }

  return <PlannerPageClient isPremium={isPremium} initialPreferences={initialPreferences} />;
}
