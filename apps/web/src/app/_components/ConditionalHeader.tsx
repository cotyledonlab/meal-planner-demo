'use client';

import { usePathname } from 'next/navigation';
import { Header } from '~/components/layout/Header';

export function ConditionalHeader() {
  const pathname = usePathname();

  // Hide header on landing, auth pages, planner wizard, and print views
  const hideHeader =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname === '/planner' ||
    pathname.endsWith('/print');

  if (hideHeader) {
    return null;
  }

  return <Header />;
}
