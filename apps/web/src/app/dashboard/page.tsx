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
    await signOut({ redirectTo: '/' });
  }

  return (
    <DashboardClient
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
      signOutAction={handleSignOut}
    />
  );
}
