import '~/styles/globals.css';

import { type Metadata } from 'next';

import { TRPCReactProvider } from '~/trpc/react';
import { SessionProvider } from '~/app/_components/SessionProvider';
import { ConditionalHeader } from '~/app/_components/ConditionalHeader';

export const metadata: Metadata = {
  title: 'MealMind AI - Your Family, Fed and Happy',
  description:
    'Stop stressing about "What\'s for dinner?" Join Irish families saving time, money, and sanity with smart meal planning. Free meal plans, shopping lists, and supermarket savings.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <SessionProvider>
          <ConditionalHeader />
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
