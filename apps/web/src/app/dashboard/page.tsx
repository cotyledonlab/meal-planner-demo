import { redirect } from 'next/navigation';

import { auth } from '~/server/auth';
import { api } from '~/trpc/server';
import DashboardClient from './_components/DashboardClient';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }

  const mealPlan = await api.mealPlan.getCurrent();

  return (
    <DashboardClient
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
      hasMealPlan={!!mealPlan}
    />
  );
}
