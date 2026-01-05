import { redirect } from 'next/navigation';

import AdminRecipeBuilderClient from '~/app/dashboard/admin/recipes/new/_components/AdminRecipeBuilderClient';
import { auth } from '~/server/auth';
import { isGeminiRecipeConfigured } from '~/server/services/geminiRecipe';

export default async function AdminRecipeNewPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/admin/recipes/new');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminRecipeBuilderClient isConfigured={isGeminiRecipeConfigured()} />;
}
