'use client';

import { usePathname } from 'next/navigation';
import { Header } from '~/components/layout/Header';

export function ConditionalHeader() {
  const pathname = usePathname();

  // Hide header on landing, auth pages, and planner wizard
  const hideHeader = pathname === '/' || pathname.startsWith('/auth/') || pathname === '/planner';

  if (hideHeader) {
    return null;
  }

  return <Header />;
}
