import '~/styles/globals.css';

import { type Metadata } from 'next';

import { TRPCReactProvider } from '~/trpc/react';
import { SessionProvider } from '~/app/_components/SessionProvider';

export const metadata: Metadata = {
  title: 'MealMind AI - Simplify Your Weekly Meals',
  description:
    'Plan, prep, and shop smarter with weekly recipes and cost-saving supermarket insights. Built for families in Ireland. Free meal plans and shopping lists.',
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <SessionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
