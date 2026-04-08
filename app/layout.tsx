import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientProviders from '@/components/ClientProviders';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Casino Builder',
    template: '%s | Casino Builder',
  },
  description: 'Describe an app. Get a live URL. Casino builds full-stack apps with AI agents, user auth, and persistent data — from a single conversation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
