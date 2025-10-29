import { redirect } from 'next/navigation';

import { auth, signOut } from '~/server/auth';
import DashboardClient from './_components/DashboardClient';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }

  async function handleSignOut() {
    'use server';
    const basePath = process.env.BASE_PATH ?? '/demos/meal-planner';
    await signOut({ redirectTo: basePath });
  }

  return (
    <DashboardClient
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
      signOutAction={handleSignOut}
    />
  );
}
