import { Metadata } from 'next';
import HomePage from '@/components/landing/HomePage';

export const metadata: Metadata = {
  title: "iLoveHACCP | Free HACCP Plan Generator & Food Safety Tools",
  description: "Create a professional HACCP plan in minutes. Our free system helps food businesses manage compliance, run hazard analysis, and prepare for audits.",
  alternates: {
    canonical: 'https://www.ilovehaccp.com',
  },
  openGraph: {
    title: 'iLoveHACCP | Free HACCP Plan Generator',
    description: 'Create a professional HACCP plan in minutes. EC 852/2004 compliant food safety for restaurants, manufacturers, and catering.',
    url: 'https://www.ilovehaccp.com',
  }
};

export default function Page() {
  return <HomePage />;
}
