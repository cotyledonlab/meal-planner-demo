import { redirect } from 'next/navigation';

import AdminImageGeneratorClient from '~/app/dashboard/admin/images/_components/AdminImageGeneratorClient';
import { auth } from '~/server/auth';
import { api } from '~/trpc/server';
import { isGeminiConfigured } from '~/server/services/geminiImage';
import { env } from '~/env';

function getStorageInfo() {
  const provider = env.STORAGE_PROVIDER ?? 'local';
  if (provider === 's3') {
    const bucket = env.S3_BUCKET ?? 'unknown';
    const endpoint = env.S3_ENDPOINT ?? '';
    // Extract hostname from endpoint for display
    const host = endpoint ? new URL(endpoint).hostname : 'S3';
    return {
      provider: 's3' as const,
      location: `${host}/${bucket}`,
    };
  }
  return {
    provider: 'local' as const,
    location: '/public/generated-images',
  };
}

export default async function AdminImagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/admin/images');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  const images = await api.adminImage.list({ limit: 24 });
  const storageInfo = getStorageInfo();

  return (
    <AdminImageGeneratorClient
      initialImages={images}
      isConfigured={isGeminiConfigured()}
      storageInfo={storageInfo}
    />
  );
}
