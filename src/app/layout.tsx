import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { Providers } from "@/components/providers";
import ScrollToTop from "@/components/layout/ScrollToTop";
import CookieConsent from "@/components/layout/CookieConsent";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window === "undefined") {
  const anonKeyPrefix = supabaseAnonKey ? supabaseAnonKey.slice(0, 6) : "missing";
  console.log("[startup] NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ?? "missing");
  console.log("[startup] NEXT_PUBLIC_SUPABASE_ANON_KEY prefix:", anonKeyPrefix);
}

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const merriweather = Merriweather({ 
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: '--font-merriweather'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ilovehaccp.com'),
  description: "Free online HACCP tool for food businesses in the UK & Europe. Build compliant HACCP plans and prepare for audits with iLoveHACCP.",
  keywords: ["HACCP", "Food Safety", "HACCP Plan Generator", "Food Hygiene", "Restaurant Compliance"],
  authors: [{ name: "iLoveHACCP Team" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.ilovehaccp.com',
    siteName: 'iLoveHACCP',
    title: 'iLoveHACCP | EU & UK Compliant Food Safety Plans',
    description: "Free online HACCP tool for food businesses. Build EC 852/2004 compliant plans, manage compliance, and prepare for audits with iLoveHACCP.",
    images: [
      {
        url: '/og-image.jpg', // Ensure this exists in public/
        width: 1200,
        height: 630,
        alt: 'iLoveHACCP Platform'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iLoveHACCP | Food Safety Plans',
    description: "Free online HACCP tool for food businesses in the UK & Europe. Build compliant HACCP plans and prepare for audits with iLoveHACCP.",
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/Icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('app-theme');if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} font-sans`}>
        <Providers>
          <ScrollToTop />
          <CookieConsent />
          <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800" />}>
            <Navbar />
          </Suspense>
          <main className="min-h-screen">
            {children}
          </main>
          <ConditionalFooter />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
