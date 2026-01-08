'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '~/components/ui/sheet';
import { cn } from '~/lib/utils';

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="group flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-150 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm transition-transform duration-150 group-hover:scale-105">
        <svg
          className="h-5 w-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      </div>
      <span className="text-xl font-bold text-gray-900 transition-colors duration-150 group-hover:text-emerald-700">
        MealMind
      </span>
    </Link>
  );
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
  },
];

export function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    await signOut({ callbackUrl: `${basePath}/` });
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo />

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
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          {session?.user && (
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'transition-colors',
                      mobileMenuOpen && 'bg-gray-900 text-white hover:bg-gray-800'
                    )}
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                    <SheetDescription className="sr-only">
                      Quick access to navigation and account actions
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-3">
                    {navItems.map((item, index) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="flex min-h-[48px] items-center rounded-md px-4 py-3 text-base font-semibold text-gray-800 transition-all duration-200 ease-out hover:translate-x-1 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                      >
                        {item.label}
                      </Link>
                    ))}

                    {/* User Info */}
                    <div className="rounded-md border border-emerald-100 bg-emerald-50/80 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Signed in as
                      </p>
                      <p className="break-words text-base font-semibold text-emerald-900">
                        {session.user?.email}
                      </p>
                    </div>

                    {/* Sign Out Button */}
                    <Button
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        void handleSignOut();
                      }}
                    >
                      Sign out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
