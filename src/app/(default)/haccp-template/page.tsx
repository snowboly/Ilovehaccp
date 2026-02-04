import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { FileText, FileSpreadsheet, CheckCircle2, ArrowRight, Download, AlertTriangle } from 'lucide-react';
import JSONLD from '@/components/layout/JSONLD';

export const metadata: Metadata = {
  title: 'HACCP Template | Word & PDF Export | iLoveHACCP',
  description: 'Generate a custom HACCP template for your food business. Export to Word (DOCX) and PDF formats. Built for UK and EU compliance with Regulation 852/2004.',
  keywords: 'HACCP template, HACCP Word template, HACCP DOCX, HACCP document template, free HACCP template, restaurant HACCP template, bakery HACCP template',
  alternates: { canonical: 'https://www.ilovehaccp.com/haccp-template' },
  openGraph: {
    title: 'HACCP Template | Word & PDF Export',
    description: 'Generate custom HACCP templates. Export to editable Word and professional PDF formats.',
    type: 'website',
    url: 'https://www.ilovehaccp.com/haccp-template'
  }
};

export default function HACCPTemplatePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "HACCP Template Generator",
    "description": "Generate custom HACCP templates with Word (DOCX) and PDF export for UK and EU food safety compliance.",
    "publisher": {
      "@type": "Organization",
      "name": "iLoveHACCP",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.ilovehaccp.com/icon.svg"
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <JSONLD data={structuredData} />

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 block">
            Document Generator
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-[1.1]">
            HACCP Template
          </h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
            Generate a custom HACCP document for your food business.
            Export to Word (DOCX) for editing or PDF for distribution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/builder"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Generate My Template <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sample-haccp-plan-pdf"
              className="bg-slate-100 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" /> View Sample PDF
            </Link>
          </div>
        </div>
      </div>

      {/* Export Formats Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">
          Export Formats
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Word Format */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Word (DOCX)</h3>
                <span className="text-sm text-slate-500">Editable Document</span>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                'Fully editable in Microsoft Word',
                'Update as your processes change',
                'Add company branding',
                'Print-ready formatting'
              ].map((item) => (
                <li key={item} className="flex gap-2 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg">
              Best for: Ongoing document management and auditor submissions
            </p>
          </div>

          {/* PDF Format */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-rose-100 p-3 rounded-xl">
                <FileText className="w-8 h-8 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">PDF</h3>
                <span className="text-sm text-slate-500">Fixed-Layout Document</span>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                'Professional fixed layout',
                'Consistent across all devices',
                'Ideal for sharing and archiving',
                'Secure, uneditable format'
              ].map((item) => (
                <li key={item} className="flex gap-2 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg">
              Best for: Inspector presentations and permanent records
            </p>
          </div>
        </div>
      </div>

      {/* Warning About Generic Templates */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-amber-900 mb-2">
              Why Generic Templates Fail Inspections
            </h3>
            <p className="text-amber-800">
              Environmental Health Officers check that your HACCP plan reflects your actual operations.
              A generic template downloaded from the internet shows the same hazard analysis for every business.
              Inspectors see through this immediately. Your plan must be specific to your products, processes, and premises.
            </p>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">
          Template Structure
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { num: '1', title: 'Business Profile', desc: 'Company details, registration, contact information' },
              { num: '2', title: 'Product Description', desc: 'Ingredients, allergens, shelf life, storage requirements' },
              { num: '3', title: 'Process Flow Diagram', desc: 'Step-by-step production from receiving to dispatch' },
              { num: '4', title: 'Hazard Analysis', desc: 'Biological, chemical, physical hazards per step' },
              { num: '5', title: 'CCP Determination', desc: 'Critical control points with limits and monitoring' },
              { num: '6', title: 'Corrective Actions', desc: 'Procedures when critical limits are exceeded' },
              { num: '7', title: 'Verification', desc: 'How effectiveness of the system is validated' },
              { num: '8', title: 'Record-Keeping', desc: 'Documentation requirements and log templates' }
            ].map((item) => (
              <div key={item.num} className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                  {item.num}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industry Templates */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">
          Industry-Specific Templates
        </h2>
        <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
          Our builder generates customized HACCP plans based on your industry.
          The hazard analysis and CCPs are tailored to your specific food handling operations.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'Restaurant',
            'Bakery',
            'Food Truck',
            'Catering',
            'Butcher',
            'Cafe',
            'Takeaway',
            'Manufacturer'
          ].map((industry) => (
            <div
              key={industry}
              className="bg-white border border-slate-200 rounded-xl p-4 text-center font-semibold text-slate-700 hover:border-blue-300 transition-colors"
            >
              {industry}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <h2 className="text-3xl font-black mb-4 relative z-10">
            Generate Your HACCP Template
          </h2>
          <p className="text-slate-300 text-lg mb-6 max-w-xl mx-auto relative z-10">
            Answer questions about your business. Get a custom HACCP document in Word and PDF format.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link
              href="/builder"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              Start Building <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sample-haccp-plan-pdf"
              className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Preview Sample
            </Link>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-slate-100 rounded-2xl p-8">
          <h3 className="font-bold text-slate-900 mb-4">Related Resources</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/sample-haccp-plan-pdf" className="text-blue-600 hover:text-blue-800 font-medium underline">
              HACCP Plan Example PDF
            </Link>
            <span className="text-slate-400">|</span>
            <Link href="/requirements-eu-uk" className="text-blue-600 hover:text-blue-800 font-medium underline">
              EU & UK Requirements
            </Link>
            <span className="text-slate-400">|</span>
            <Link href="/resources" className="text-blue-600 hover:text-blue-800 font-medium underline">
              Knowledge Base
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
