import JSONLD from '@/components/layout/JSONLD';
import HomeClient from '@/components/landing/HomeClient';

export default function HomePage() {
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
