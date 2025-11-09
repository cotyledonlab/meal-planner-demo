'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { PLAN_METADATA } from '@meal-planner-demo/constants';

import AuthLayout from '../_components/AuthLayout';
import PasswordInput from '../_components/PasswordInput';

const premiumPlan = PLAN_METADATA.premium;
const premiumPriceLabel = `${premiumPlan.price}${premiumPlan.period ?? ''}`;
const premiumFeatureHighlights = premiumPlan.features.slice(0, 3);

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier');
  const isPremium = tier === 'premium';
  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');
  const isPaymentStep = isPremium && currentStep === 'payment';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    confirmMock: false,
  });

  const validatePaymentStep = () => {
    if (
      !paymentData.cardName ||
      !paymentData.cardNumber ||
      !paymentData.expiry ||
      !paymentData.cvc
    ) {
      setPaymentError('Please add mock card details to continue.');
      return false;
    }
    if (!paymentData.confirmMock) {
      setPaymentError('Please confirm you understand this is a mock payment.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPremium && currentStep === 'details') {
      setCurrentStep('payment');
      return;
    }

    setError('');
    setValidationErrors({});
    setPaymentError('');

    if (isPaymentStep && !validatePaymentStep()) {
      return;
    }

    setLoading(true);

    try {
      // Use NEXT_PUBLIC_BASE_PATH if defined, otherwise empty string for root deployment
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
      const response = await fetch(`${basePath}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tier: isPremium ? 'premium' : 'basic',
        }),
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

      // User is now signed in via session created on server
      // No need to resend password in cleartext
      router.push('/dashboard');
      router.refresh();
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

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (paymentError) {
      setPaymentError('');
    }
  };

  const primaryButtonLabel = loading
    ? 'Creating account...'
    : isPaymentStep
      ? 'Complete payment & create account'
      : isPremium
        ? 'Continue to payment'
        : 'Create account';

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
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">
                {isPaymentStep ? 'Step 2 of 2 — Mock payment' : 'Step 1 of 2 — Account details'}
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Premium Tier: {premiumPriceLabel} • {premiumPlan.spotlight}
              </p>
              {isPaymentStep && (
                <p className="mt-2 text-xs text-emerald-700">
                  This is a fake payment screen — no real charges happen today. It simply unlocks
                  premium permissions for testing.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4" role="alert" aria-live="polite">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {isPaymentStep ? (
            <div className="space-y-6 rounded-xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Mock payment details</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Enter pretend card info so we can show the final confirmation screen. These values
                  are not saved and no charge is made.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                    Name on card
                  </label>
                  <input
                    id="cardName"
                    name="cardName"
                    type="text"
                    autoComplete="cc-name"
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="Jamie Example"
                    value={paymentData.cardName}
                    onChange={handlePaymentChange}
                  />
                </div>
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                    Card number
                  </label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="4242 4242 4242 4242"
                    value={paymentData.cardNumber}
                    onChange={handlePaymentChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
                      Expiry
                    </label>
                    <input
                      id="expiry"
                      name="expiry"
                      type="text"
                      autoComplete="cc-exp"
                      className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="04 / 28"
                      value={paymentData.expiry}
                      onChange={handlePaymentChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                      CVC
                    </label>
                    <input
                      id="cvc"
                      name="cvc"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      placeholder="123"
                      value={paymentData.cvc}
                      onChange={handlePaymentChange}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">MealMind Premium</p>
                      <p className="text-emerald-800">{premiumPriceLabel} — charged later</p>
                    </div>
                    <p className="text-lg font-semibold text-emerald-700">€0.00 today</p>
                  </div>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-emerald-800">
                    {premiumFeatureHighlights.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <label className="inline-flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="confirmMock"
                    checked={paymentData.confirmMock}
                    onChange={handlePaymentChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <span>
                    I understand this is a mock payment screen and grants premium access instantly.
                  </span>
                </label>
                {paymentError && (
                  <p className="text-sm text-red-600" role="alert">
                    {paymentError}
                  </p>
                )}
              </div>
            </div>
          ) : (
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
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  aria-describedby="password-hint"
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {validationErrors.password}
                  </p>
                )}
                <p id="password-hint" className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with one uppercase letter and one number
                </p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full min-h-[48px] items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {primaryButtonLabel}
            </button>
            {isPaymentStep && (
              <button
                type="button"
                className="mt-3 w-full min-h-[44px] rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={() => {
                  setCurrentStep('details');
                  setPaymentError('');
                }}
              >
                Back to details
              </button>
            )}
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
