import { redirect } from 'next/navigation';

import { auth } from '~/server/auth';
import DashboardClient from './_components/DashboardClient';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }

  return (
    <DashboardClient
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    />
  );
}
