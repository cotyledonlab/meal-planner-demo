import { redirect } from 'next/navigation';

import AdminImageGeneratorClient from '~/app/dashboard/admin/images/_components/AdminImageGeneratorClient';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';
import { isGeminiConfigured } from '~/server/services/geminiImage';

export default async function AdminImagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/admin/images');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const images = await api.adminImage.list({ limit: 24 });

  return <AdminImageGeneratorClient initialImages={images} isConfigured={isGeminiConfigured()} />;
}
