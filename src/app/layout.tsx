import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/providers";
import SEO from "@/components/layout/SEO";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "iLoveHACCP | Free AI HACCP Plan Generator & Food Safety Tools",
  description: "Create a professional HACCP plan in minutes with our free AI builder. Trusted by chefs and food businesses worldwide. 100% compliant & audit-ready.",
  keywords: ["HACCP", "Food Safety", "HACCP Plan Generator", "AI HACCP", "Food Hygiene", "Restaurant Compliance"],
  icons: {
    icon: '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <SEO />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}