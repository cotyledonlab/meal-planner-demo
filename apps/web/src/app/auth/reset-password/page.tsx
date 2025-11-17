'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { api } from '~/trpc/react';
import AuthLayout from '../_components/AuthLayout';
import PasswordInput from '../_components/PasswordInput';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const verifyToken = api.passwordReset.verifyToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const resetPassword = api.passwordReset.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  useEffect(() => {
    if (!token) {
      setError('No reset token provided');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    resetPassword.mutate({ token, password });
  };

  if (!token || (verifyToken.data && !verifyToken.data.valid)) {
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
          title="Invalid reset link"
          subtitle="This password reset link is invalid or has expired"
          showMarketing={false}
        >
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="mb-4 text-sm text-gray-700">
              This reset link may have expired or already been used. Reset links are only valid for
              1 hour.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              Request a new reset link
            </Link>
          </div>
        </AuthLayout>
      </>
    );
  }

  if (success) {
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
          title="Password reset successful"
          subtitle="You can now sign in with your new password"
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
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mb-4 text-sm text-gray-700">
              Your password has been successfully reset. Redirecting to sign in...
            </p>
          </div>
        </AuthLayout>
      </>
    );
  }

  if (verifyToken.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Verifying reset link...</div>
      </div>
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
        title="Create new password"
        subtitle="Enter your new password below"
        showMarketing={false}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                required
                aria-describedby="password-requirements"
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Enter new password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p id="password-requirements" className="mt-1 text-xs text-gray-500">
                Minimum 8 characters required
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="flex w-full min-h-[48px] items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {resetPassword.isPending ? 'Resetting password...' : 'Reset password'}
            </button>
          </div>
        </form>
      </AuthLayout>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
