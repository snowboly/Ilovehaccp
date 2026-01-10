import { Metadata } from 'next';
import HomeClient from './HomeClient';
import JSONLD from '@/components/layout/JSONLD';

export const metadata: Metadata = {
  title: "iLoveHACCP | Free HACCP Plan Generator & Food Safety Tools",
  description: "Create a professional HACCP plan in minutes. Our advanced system helps food businesses manage compliance, conduct hazard analysis, and prepare for audits for free.",
  alternates: {
    canonical: 'https://www.ilovehaccp.com',
  },
  openGraph: {
    title: 'iLoveHACCP | Free HACCP Plan Generator',
    description: 'Create a professional HACCP plan in minutes. Expert-validated food safety for restaurants, manufacturers, and catering.',
    url: 'https://www.ilovehaccp.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'iLoveHACCP Platform'
      }
    ],
  }
};

export default function Page() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "iLoveHACCP",
    "url": "https://www.ilovehaccp.com",
    "logo": "https://www.ilovehaccp.com/icon.svg",
    "description": "Professional HACCP plan generator for food businesses.",
    "sameAs": [
      "https://twitter.com/ilovehaccp", 
      "https://linkedin.com/company/ilovehaccp"
    ]
  };

  return (
    <>
      <JSONLD data={structuredData} />
      <HomeClient />
    </>
  );
}
