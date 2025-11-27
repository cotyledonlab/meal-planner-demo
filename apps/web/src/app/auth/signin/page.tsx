'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import AuthLayout from '../_components/AuthLayout';
import PasswordInput from '../_components/PasswordInput';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const hasDiscordProvider = !!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError(
        "We couldn't sign you in right now. Check your connection and try again in a moment."
      );
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    await signIn('discord', { callbackUrl });
  };

  return (
    <>
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 py-2 text-sm text-gray-600 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>
      <AuthLayout
        title="Welcome back"
        subtitle={
          <>
            New to MealMind AI?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-emerald-600 transition-colors duration-150 hover:text-emerald-500"
            >
              Create an account
            </Link>
          </>
        }
        showMarketing={false}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4"
              role="alert"
              aria-live="polite"
            >
              <svg
                className="mt-0.5 h-5 w-5 text-amber-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
              <p className="text-sm text-amber-900">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition-all duration-150 placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:shadow-md"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-emerald-600 transition-colors duration-150 hover:text-emerald-500"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition-all duration-150 placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:shadow-md"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-md transition-all duration-150 ease-out hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] active:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:hover:shadow-sm disabled:active:scale-100 ${
                loading ? 'animate-pulse' : ''
              }`}
              aria-busy={loading}
            >
              {loading && (
                <svg
                  className="h-5 w-5 animate-spin text-white drop-shadow-sm"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle className="opacity-30" cx="12" cy="12" r="9" />
                  <path d="M21 12a9 9 0 0 0-9-9" />
                </svg>
              )}
              <span>{loading ? 'Signing you in...' : 'Sign in'}</span>
            </button>
          </div>

          {hasDiscordProvider && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-700">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDiscordSignIn}
                className="flex w-full min-h-[48px] items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base font-semibold text-gray-700 shadow-sm transition-all duration-150 ease-out hover:bg-gray-50 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Discord
              </button>
            </>
          )}
        </form>
      </AuthLayout>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center gap-3 text-sm font-semibold text-gray-600">
          <svg
            className="h-5 w-5 animate-spin text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" />
            <path d="M22 12a10 10 0 0 0-10-10" />
          </svg>
          Loading sign in...
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
