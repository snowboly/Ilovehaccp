import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sample HACCP Plan PDF | Free Preview & Download | iLoveHACCP',
  description: 'View and download a sample HACCP plan PDF. See real document structure, hazard analysis tables, and CCP documentation. Export clean Word (DOCX) and PDF formats.',
  keywords: 'HACCP plan PDF, sample HACCP plan, HACCP template PDF, HACCP document example, HACCP plan download, free HACCP template',
  alternates: { canonical: 'https://www.ilovehaccp.com/sample-haccp-plan-pdf' },
  openGraph: {
    title: 'Sample HACCP Plan PDF | Free Preview',
    description: 'View a complete HACCP plan document structure. Download watermarked preview or upgrade to clean Word export.',
    type: 'website',
    url: 'https://www.ilovehaccp.com/sample-haccp-plan-pdf'
  }
};

export default function SamplePlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
