import type { Metadata } from "next";
import localFont from "next/font/local";
import "../../globals.css";
import Navbar from "@/components/layout/Navbar";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import { Providers } from "@/components/providers";
import ScrollToTop from "@/components/layout/ScrollToTop";
import CookieConsent from "@/components/layout/CookieConsent";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { getDictionary, SUPPORTED_LOCALES, type Language } from "@/lib/locales";
import { notFound } from "next/navigation";

const inter = localFont({
  src: [
    { path: "../../../../public/fonts/Roboto-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../../../public/fonts/Roboto-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../../../public/fonts/Roboto-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../../../public/fonts/Roboto-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = localFont({
  src: [
    { path: "../../../../public/fonts/Roboto-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../../../public/fonts/Roboto-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-merriweather",
  display: "swap",
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iLoveHACCP | Food Safety Plans',
    description: "Free online HACCP tool for food businesses in the UK & Europe. Build compliant HACCP plans and prepare for audits with iLoveHACCP.",
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  const language = locale as Language;
  if (!SUPPORTED_LOCALES.includes(language)) {
    notFound();
  }
  const dictionary = await getDictionary(language);

  return (
    <html lang={language} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('app-theme');if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} font-sans`}>
        <Providers initialLanguage={language} initialDictionary={dictionary}>
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
