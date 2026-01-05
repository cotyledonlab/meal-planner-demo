import { redirect } from 'next/navigation';

import AdminRecipesClient from '~/app/dashboard/admin/recipes/_components/AdminRecipesClient';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';

export default async function AdminRecipesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/admin/recipes');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const recipes = await api.adminRecipe.list({ limit: 50 });

  return <AdminRecipesClient initialRecipes={recipes} />;
}
