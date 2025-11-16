'use client';

import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footerSlot?: ReactNode;
  /** When true, shows full marketing content. When false, shows minimal branding (logo + tagline only). Default: true */
  showMarketing?: boolean;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerSlot,
  showMarketing = true,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-full">
      {/* Left Panel - Brand and Value Props (hidden on mobile) */}
      <div className="relative hidden w-0 flex-1 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(16,185,129,0.08)_0%,_transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-center px-8 lg:px-12">
          <div className="max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <span className="text-4xl">🍽️</span>
              <h1 className="text-3xl font-bold text-gray-900">MealMind AI</h1>
            </div>
            {showMarketing ? (
              <>
                <p className="text-xl font-semibold text-gray-900">
                  Your AI-powered meal planning assistant
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      ✓
                    </span>
                    <span className="text-gray-700">
                      Generate personalized 7-day meal plans in seconds
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      ✓
                    </span>
                    <span className="text-gray-700">
                      Automatic shopping lists with smart ingredients
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      ✓
                    </span>
                    <span className="text-gray-700">
                      Tailored to your dietary needs and preferences
                    </span>
                  </li>
                </ul>
              </>
            ) : (
              <p className="text-lg text-gray-600">Smart meal planning made simple</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full flex-1 flex-col justify-center overflow-y-auto px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2 md:hidden">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-2xl font-bold text-gray-900">MealMind AI</h1>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
          </div>

          <div className="mt-8">{children}</div>

          {footerSlot && <div className="mt-6">{footerSlot}</div>}
        </div>
      </div>
    </div>
  );
}
