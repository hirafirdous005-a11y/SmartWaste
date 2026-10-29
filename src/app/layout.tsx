import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Smart Waste Monitoring System | AI & GPS Waste Management Platform',
  description:
    'Full-stack intelligent environmental platform connecting citizens, administrators, and sanitation workers to report, classify, assign, and collect waste using AI computer vision and real-time GPS.',
  keywords: [
    'smart waste management',
    'AI waste classification',
    'GPS waste monitoring',
    'citizen complaint portal',
    'sanitation worker management',
  ],
  authors: [{ name: 'Municipal Cleanliness & Environmental Authority' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/smart-waste-logo.svg',
    shortcut: '/smart-waste-logo.svg',
    apple: '/smart-waste-logo.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-app-professional text-slate-900 font-sans antialiased relative selection:bg-emerald-500 selection:text-white">
        <AppProvider>
          {/* Global Ambient Background Decorative Lighting (Fixed & Persistent across all routes) */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-40 -left-40 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
            <div className="absolute top-1/4 -right-32 w-80 sm:w-[450px] h-80 sm:h-[450px] rounded-full bg-sky-500/5 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-teal-500/4 blur-3xl" />
          </div>

          <Suspense fallback={<div className="h-16 bg-white/80 border-b border-slate-200" />}>
            <Navbar />
          </Suspense>
          <main className="relative z-1 flex-1 pb-16 lg:pb-0">{children}</main>
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
