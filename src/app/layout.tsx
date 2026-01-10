import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/providers";
import SEO from "@/components/layout/SEO";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const merriweather = Merriweather({ 
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: '--font-merriweather'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ilovehaccp.com'),
  title: {
    default: "iLoveHACCP | Free HACCP Plan Generator & Food Safety Tools",
    template: "%s | iLoveHACCP"
  },
  description: "Free online HACCP tool for food businesses. Build HACCP plans, manage compliance, and prepare for audits with iLoveHACCP.",
  keywords: ["HACCP", "Food Safety", "HACCP Plan Generator", "Food Hygiene", "Restaurant Compliance"],
  authors: [{ name: "iLoveHACCP Team" }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.ilovehaccp.com',
    siteName: 'iLoveHACCP',
    title: 'iLoveHACCP | Precision-Engineered Food Safety Plans',
    description: "Free online HACCP tool for food businesses. Build HACCP plans, manage compliance, and prepare for audits with iLoveHACCP.",
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
    description: "Free online HACCP tool for food businesses. Build HACCP plans, manage compliance, and prepare for audits with iLoveHACCP.",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} font-sans`}>
        <Providers>
          <ScrollToTop />
          <Suspense fallback={<div className="h-16 bg-white border-b border-slate-100" />}>
            <Navbar />
          </Suspense>
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}