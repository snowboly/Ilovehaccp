import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
import LanguageHandler from "@/components/layout/LanguageHandler";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ilovehaccp.com | AI-Powered HACCP Plan Generator",
  description: "Create professional, compliance-ready HACCP plans in minutes using AI. Verified by food safety experts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <LanguageHandler />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
