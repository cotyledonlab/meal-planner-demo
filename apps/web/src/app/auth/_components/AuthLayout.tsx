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
      <div className="relative hidden w-0 flex-1 md:block">
        {/* Gradient background with patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(255,255,255,0.08)_0%,_transparent_50%)]" />
        
        <div className="relative flex h-full flex-col justify-center px-8 lg:px-12">
          <div className="max-w-md">
            <div className="mb-8 flex items-center gap-3">
              <span className="text-5xl">🍽️</span>
              <h1 className="text-3xl font-bold text-white">MealMind AI</h1>
            </div>
            {showMarketing ? (
              <>
                <p className="text-2xl font-bold text-white">
                  Your AI-powered meal planning assistant
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-100 backdrop-blur-sm">
                      ✓
                    </span>
                    <span className="text-base text-emerald-50">
                      Generate personalized 7-day meal plans in seconds
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-100 backdrop-blur-sm">
                      ✓
                    </span>
                    <span className="text-base text-emerald-50">
                      Automatic shopping lists with smart ingredients
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-100 backdrop-blur-sm">
                      ✓
                    </span>
                    <span className="text-base text-emerald-50">
                      Tailored to your dietary needs and preferences
                    </span>
                  </li>
                </ul>
              </>
            ) : (
              <p className="text-xl text-emerald-100">Smart meal planning made simple</p>
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
