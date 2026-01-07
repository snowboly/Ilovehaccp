"use client";

import Head from 'next/head';
import { useLanguage } from '@/lib/i18n';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: 'website' | 'article';
}

export default function SEO({ title, description, canonical, type = 'website' }: SEOProps) {
  const { language } = useLanguage();
  
  const siteName = "ilovehaccp.com";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDesc = description || "Generate professional HACCP plans in minutes using our free tool.";
  
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      
      {/* Language Meta */}
      <meta name="language" content={language} />
      
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": siteName,
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "EUR"
            },
            "description": fullDesc
          })
        }}
      />
    </>
  );
}
