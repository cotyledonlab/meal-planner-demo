'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // When using Next.js basePath, we need to tell NextAuth's client where the API routes are
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/demos/meal-planner';

  return (
    <NextAuthSessionProvider basePath={`${basePath}/api/auth`}>{children}</NextAuthSessionProvider>
  );
}
