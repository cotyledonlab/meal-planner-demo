'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import AuthLayout from '../_components/AuthLayout';
import CelebrationModal from '../_components/CelebrationModal';
import PasswordInput from '../_components/PasswordInput';
import ProgressIndicator from '../_components/ProgressIndicator';
import StepTransition from '../_components/StepTransition';
import TierSelection from '../_components/TierSelection';

function SignUpForm() {
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier');

  const [currentStep, setCurrentStep] = useState<'tier' | 'details' | 'payment'>(
    tierParam === 'premium' ? 'details' : 'tier'
  );
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium'>('premium');

  const isPremium = selectedTier === 'premium';
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
  const [showCelebration, setShowCelebration] = useState(false);
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

    if (currentStep === 'tier') {
      setCurrentStep('details');
      return;
    }

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
          tier: selectedTier === 'premium' ? 'premium' : 'basic',
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
          setError(
            data.error ??
              'We could not finish creating your account. Please check your details and try again.'
          );
        }
        return;
      }

      // User is now signed in via session created on server
      // Show celebration modal instead of immediate redirect
      setShowCelebration(true);
    } catch (err) {
      setError(
        "We hit a snag creating your account. Please check your connection and try again. If this keeps happening, we'll sort it out—just let us know."
      );
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
    ? 'Setting up your meal plan...'
    : isPaymentStep
      ? 'Complete payment & create account'
      : currentStep === 'tier'
        ? 'Continue'
        : isPremium
          ? 'Continue to payment'
          : 'Create account';

  // Compute progress steps
  const getProgressSteps = () => {
    const steps = [
      {
        label: 'Plan',
        status: currentStep === 'tier' ? ('current' as const) : ('completed' as const),
      },
      {
        label: 'Details',
        status:
          currentStep === 'tier'
            ? ('upcoming' as const)
            : currentStep === 'details'
              ? ('current' as const)
              : ('completed' as const),
      },
    ];

    if (isPremium) {
      steps.push({
        label: 'Payment',
        status: currentStep === 'payment' ? ('current' as const) : ('upcoming' as const),
      });
    }

    return steps;
  };

  return (
    <>
      {showCelebration && <CelebrationModal userName={formData.name} tier={selectedTier} />}
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
        title={
          currentStep === 'tier'
            ? 'Create your account'
            : isPremium
              ? 'Get Premium Access'
              : 'Create your account'
        }
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
          {/* Progress indicator */}
          <div className="mb-8">
            <ProgressIndicator steps={getProgressSteps()} />
          </div>

          <StepTransition stepKey={currentStep}>
            {isPremium && currentStep !== 'tier' && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">
                  {isPaymentStep ? 'Mock payment' : 'Account details'}
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Premium Tier: €4.99/month • Advanced plan settings, longer plans, and supermarket
                  comparisons.
                </p>
                {isPaymentStep && (
                  <p className="mt-2 text-xs text-emerald-700">
                    This is a fake payment screen — no real charges happen today. It simply unlocks
                    premium permissions for testing.
                  </p>
                )}
              </div>
            )}

            {!isPremium && currentStep === 'details' && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Account details</p>
                <p className="mt-1 text-sm text-gray-700">
                  Free Tier: Get started with basic meal planning features.
                </p>
              </div>
            )}

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

            {currentStep === 'tier' ? (
              <TierSelection selectedTier={selectedTier} onTierSelect={setSelectedTier} />
            ) : isPaymentStep ? (
              <div className="space-y-6 rounded-xl border border-emerald-100 bg-white/80 p-5 shadow-sm">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Mock payment details</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Enter pretend card info so we can show the final confirmation screen. These
                    values are not saved and no charge is made.
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
                      className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                      className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                        <p className="text-emerald-800">€4.99/month — charged later</p>
                      </div>
                      <p className="text-lg font-semibold text-emerald-700">€0.00 today</p>
                    </div>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-emerald-800">
                      <li>Generate up to 7-day plans</li>
                      <li>Advanced dietary filters</li>
                      <li>Premium shopping list exports</li>
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
                      I understand this is a mock payment screen and grants premium access
                      instantly.
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
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900 shadow-sm transition placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition placeholder:text-gray-600 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {validationErrors.password}
                    </p>
                  )}
                  <p id="password-hint" className="mt-1 text-xs text-gray-700">
                    Must be at least 8 characters with one uppercase letter and one number
                  </p>
                </div>
              </div>
            )}
          </StepTransition>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300 ${
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
              <span>{primaryButtonLabel}</span>
            </button>
            {currentStep === 'details' && (
              <button
                type="button"
                className="mt-3 w-full min-h-[44px] rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={() => {
                  setCurrentStep('tier');
                }}
              >
                Back to plan selection
              </button>
            )}
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
          Preparing sign up…
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
