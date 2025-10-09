import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'MealMind',
  description: 'AI-assisted weekly meal planning demo'
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
