import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { FileText, Download, CheckCircle2, ArrowRight, FileCheck, Sparkles } from 'lucide-react';
import JSONLD from '@/components/layout/JSONLD';

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

export default function SampleHACCPPlanPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Sample HACCP Plan PDF",
    "description": "Free preview of a complete HACCP plan document with hazard analysis, CCPs, and monitoring procedures.",
    "publisher": {
      "@type": "Organization",
      "name": "iLoveHACCP",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.ilovehaccp.com/icon.svg"
      }
    },
    "mainEntity": {
      "@type": "DigitalDocument",
      "name": "Sample HACCP Plan",
      "description": "A complete HACCP plan document demonstrating hazard analysis, critical control points, and monitoring procedures.",
      "fileFormat": "application/pdf"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <JSONLD data={structuredData} />

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="text-center mb-8">
            <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 block">
              Free Document Preview
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-[1.1]">
              Sample HACCP Plan <span className="text-blue-600">PDF</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              See the exact document structure used by food businesses for EU & UK compliance.
              Preview below, then generate your own.
            </p>
          </div>

          {/* What's Included */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: FileText, label: 'Hazard Analysis Table' },
              { icon: FileCheck, label: 'CCP Documentation' },
              { icon: Sparkles, label: 'Monitoring Procedures' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                <Icon className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDF Preview Section */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Preview Header */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white" />
              <span className="text-white font-bold">Sample_HACCP_Plan.pdf</span>
              <span className="bg-amber-500 text-amber-950 text-xs font-bold px-2 py-0.5 rounded uppercase">
                Watermarked Preview
              </span>
            </div>
            <a
              href="/api/export/sample/pdf"
              download="Sample_HACCP_Plan.pdf"
              className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </div>

          {/* PDF Embed */}
          <div className="relative bg-slate-800">
            <iframe
              src="/api/export/sample/pdf"
              className="w-full h-[700px] border-0"
              title="Sample HACCP Plan PDF Preview"
            />
          </div>
        </div>

        {/* Watermark Notice */}
        <p className="text-center text-slate-500 text-sm mt-4">
          This preview contains a &quot;PREVIEW - NOT FOR OFFICIAL USE&quot; watermark.
          Generate your own plan for a clean, professional export.
        </p>
      </div>

      {/* Document Structure Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">
          What&apos;s in a HACCP Plan Document?
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: 'Business & Product Info', desc: 'Company details, product description, intended use, shelf life' },
            { title: 'Process Flow', desc: 'Step-by-step production process from receiving to dispatch' },
            { title: 'Hazard Analysis', desc: 'Biological, chemical, and physical hazards identified per step' },
            { title: 'Critical Control Points', desc: 'CCPs with critical limits, monitoring, and corrective actions' },
            { title: 'Prerequisite Programs', desc: 'Supporting programs like sanitation, pest control, training' },
            { title: 'Verification Procedures', desc: 'How the HACCP system effectiveness is validated' }
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-4 bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <h2 className="text-3xl font-black mb-4 relative z-10">
            Get Your Clean HACCP Document
          </h2>
          <p className="text-blue-100 text-lg mb-6 max-w-xl mx-auto relative z-10 font-medium">
            Generate a custom HACCP plan for your business. Export professional Word (DOCX) and PDF without watermarks.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 mb-6">
            <Link
              href="/builder"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              Build My Plan Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100 relative z-10">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Free plan generation
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Word + PDF export
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> No watermark
            </span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">
          Common Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'Can I use this sample for my business?',
              a: 'This sample is for preview purposes only. Your HACCP plan must reflect your specific products, processes, and hazards. Use our builder to generate a custom plan.'
            },
            {
              q: 'What formats can I export?',
              a: 'Professional exports include both Word (DOCX) and PDF formats. Word documents are editable for ongoing updates to your food safety system.'
            },
            {
              q: 'Is this compliant with UK and EU regulations?',
              a: 'Our plans follow the structure required by Regulation (EC) 852/2004 and UK food safety law. However, always verify your specific plan with your local Environmental Health Officer.'
            }
          ].map((faq) => (
            <div key={faq.q} className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-slate-100 rounded-2xl p-8">
          <h3 className="font-bold text-slate-900 mb-4">Related Resources</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/haccp-template" className="text-blue-600 hover:text-blue-800 font-medium underline">
              HACCP Templates
            </Link>
            <span className="text-slate-400">|</span>
            <Link href="/requirements-eu-uk" className="text-blue-600 hover:text-blue-800 font-medium underline">
              EU & UK Requirements
            </Link>
            <span className="text-slate-400">|</span>
            <Link href="/resources" className="text-blue-600 hover:text-blue-800 font-medium underline">
              Knowledge Base
            </Link>
            <span className="text-slate-400">|</span>
            <Link href="/faqs" className="text-blue-600 hover:text-blue-800 font-medium underline">
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
