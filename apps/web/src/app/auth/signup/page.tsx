'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import AuthLayout from '../_components/AuthLayout';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier');
  const isPremium = tier === 'premium';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setLoading(true);

    try {
      // Use NEXT_PUBLIC_BASE_PATH if defined, otherwise empty string for root deployment
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
      const response = await fetch(`${basePath}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as {
        error?: string;
        details?: Record<string, { _errors?: string[] }>;
      };

      if (!response.ok) {
        if (data.details) {
          const errors: Record<string, string> = {};
          Object.keys(data.details).forEach((key) => {
            const fieldErrors = data.details?.[key]?._errors;
            if (key !== '_errors' && fieldErrors?.[0]) {
              errors[key] = fieldErrors[0];
            }
          });
          setValidationErrors(errors);
        } else {
          setError(data.error ?? 'Sign up failed');
        }
        return;
      }

      // Auto sign-in after successful registration
      // FIXME return a session token from the server to negate the need to resend cleartext password
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        // Registration succeeded but sign-in failed - redirect to sign-in page
        router.push('/auth/signin?message=Account created successfully. Please sign in.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  return (
    <>
      <Link
        href="/"
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
        Back to Home
      </Link>
      <AuthLayout
        title={isPremium ? 'Get Premium Access' : 'Create your account'}
        subtitle={
          <>
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Sign in
            </Link>
          </>
        }
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {isPremium && (
            <div className="rounded-md bg-emerald-50 p-4 border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium">
                Premium Tier: €4.99/month — Best value supermarket finder, advanced customisation,
                and more!
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {validationErrors.name}
                </p>
              )}
            </div>

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
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {validationErrors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with one uppercase letter and one number
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full min-h-[48px] items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </AuthLayout>
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
