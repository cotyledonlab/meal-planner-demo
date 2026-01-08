import '~/styles/globals.css';

import { type Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import { Toaster } from 'sonner';

import { TRPCReactProvider } from '~/trpc/react';
import { SessionProvider } from '~/app/_components/SessionProvider';
import { ConditionalHeader } from '~/app/_components/ConditionalHeader';
import { PageTransition } from '~/app/_components/PageTransition';

// Display font - warm, organic serif with character
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
});

// Body font - friendly, readable sans-serif
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MealMind AI - Your Family, Fed and Happy',
  description:
    'Stop stressing about "What\'s for dinner?" Join Irish families saving time and sanity with smart meal planning. Free meal plans, shopping lists, and budget estimates.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full scroll-smooth ${fraunces.variable} ${dmSans.variable}`}>
      <body className="h-full font-body">
        <SessionProvider>
          <ConditionalHeader />
          <TRPCReactProvider>
            <PageTransition>{children}</PageTransition>
          </TRPCReactProvider>
          <Toaster position="top-right" richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
