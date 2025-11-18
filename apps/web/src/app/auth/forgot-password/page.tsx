'use client';

import Link from 'next/link';
import { useState } from 'react';

import { api } from '~/trpc/react';
import AuthLayout from '../_components/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const requestReset = api.passwordReset.requestReset.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    requestReset.mutate({ email });
  };

  if (submitted) {
    return (
      <>
        <Link
          href="/auth/signin"
          className="absolute left-4 top-4 inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
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
          Back to Sign In
        </Link>
        <AuthLayout
          title="Check your email"
          subtitle="We've sent password reset instructions to your email"
          showMarketing={false}
        >
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="mb-4 text-sm text-gray-700">
              If an account exists with <strong>{email}</strong>, you&apos;ll receive an email with
              instructions to reset your password.
            </p>
            <p className="text-xs text-gray-600">
              The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              Return to sign in
            </Link>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <Link
        href="/auth/signin"
        className="absolute left-4 top-4 inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
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
        Back to Sign In
      </Link>
      <AuthLayout
        title="Reset your password"
        subtitle="Enter your email and we'll send you a link to reset your password"
        showMarketing={false}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {requestReset.error && (
            <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
              <p className="text-sm text-red-800">{requestReset.error.message}</p>
            </div>
          )}

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
              className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={requestReset.isPending}
              className="flex w-full min-h-[48px] items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {requestReset.isPending ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      </AuthLayout>
    </>
  );
}
