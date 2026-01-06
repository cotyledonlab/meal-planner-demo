import { redirect } from 'next/navigation';

import AdminRecipeBuilderClient from '~/app/dashboard/admin/recipes/new/_components/AdminRecipeBuilderClient';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';
import { isGeminiRecipeConfigured } from '~/server/services/geminiRecipe';

interface AdminRecipeEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRecipeEditPage({ params }: AdminRecipeEditPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/dashboard/admin/recipes/${id}`);
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const recipe = await api.adminRecipe.get({ id });

  return (
    <AdminRecipeBuilderClient isConfigured={isGeminiRecipeConfigured()} initialRecipe={recipe} />
  );
}
