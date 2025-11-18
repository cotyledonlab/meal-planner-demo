'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    await signOut({ callbackUrl: `${basePath}/` });
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <Link
              href="/dashboard"
              className="rounded text-xl font-bold text-gray-900 transition-colors duration-150 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              MealMind AI
            </Link>
          </div>

          {/* Desktop Navigation */}
          {session?.user && (
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/dashboard"
                className="inline-flex min-h-[44px] items-center rounded px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Dashboard
              </Link>
              <span className="text-sm text-gray-700">{session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition-all duration-150 hover:bg-gray-50 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Sign out
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {session?.user && (
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                  mobileMenuOpen
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg
                  className="h-6 w-6 transition-transform duration-300"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu with Backdrop */}
        {session?.user && mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="animate-backdrop-fade-in fixed inset-x-0 bottom-0 top-16 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Dropdown Menu */}
            <div className="animate-slide-in-right fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-l border-gray-200 bg-white shadow-2xl md:hidden">
              <div className="space-y-2 p-4">
                <Link
                  href="/dashboard"
                  className="flex min-h-[44px] items-center rounded-md px-4 py-3 text-base font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-700 break-words">
                  {session.user.email}
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void handleSignOut();
                  }}
                  className="flex min-h-[44px] w-full items-center rounded-md px-4 py-3 text-left text-base font-medium text-gray-700 transition-all duration-150 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
