'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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

  // Close on escape for accessibility
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    await signOut({ callbackUrl: `${basePath}/` });
  };

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
    },
  ];

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!mobileMenuOpen || touchStartX === null) return;
    const currentX = event.touches[0]?.clientX;
    if (currentX === undefined) return;
    const deltaX = currentX - touchStartX;
    if (deltaX > 60) {
      setMobileMenuOpen(false);
      setTouchStartX(null);
    }
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center rounded px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  {item.label}
                </Link>
              ))}
              <span className="text-sm text-gray-700">{session.user?.email}</span>
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
        {session?.user && (
          <>
            {/* Backdrop Overlay */}
            <div
              data-testid="mobile-menu-backdrop"
              className={`fixed inset-x-0 bottom-0 top-16 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
                mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
              }`}
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
              <div
                data-testid="mobile-menu-panel"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                className="animate-slide-in-right fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-72 transform border-l border-gray-200 bg-white/90 shadow-xl backdrop-blur-md transition-transform duration-300 ease-out md:hidden"
                role="dialog"
                aria-label="Mobile navigation"
              >
                <div className="relative h-full overflow-y-auto p-5">
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-white/70 to-emerald-50/40"
                    aria-hidden="true"
                  />
                  <div className="relative space-y-3">
                    {navItems.map((item, index) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ transitionDelay: `${index * 50}ms` }}
                        className="flex min-h-[48px] items-center rounded-md px-4 py-3 text-base font-semibold text-gray-800 transition-all duration-200 ease-out translate-x-0 opacity-100 shadow-sm hover:translate-x-1 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="rounded-md border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 transition-all duration-200 opacity-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Signed in as
                      </p>
                      <p className="break-words text-base font-semibold">{session.user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        void handleSignOut();
                      }}
                      style={{ transitionDelay: '120ms' }}
                      className="flex min-h-[48px] w-full items-center justify-center rounded-md bg-gray-900 px-4 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 translate-y-0 opacity-100 shadow-lg"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
