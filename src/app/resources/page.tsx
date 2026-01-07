import { BookOpen, ShieldCheck } from 'lucide-react';
import ResourceContent from '@/components/resources/ResourceContent';
import JSONLD from '@/components/layout/JSONLD';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Food Safety Knowledge Base | HACCP Guides & Regulations',
  description: 'Everything you need to understand HACCP, compliance, and audit readiness. Expert-curated articles on food microbiology and safety protocols.',
  alternates: { canonical: '/resources' }
};

export default function ResourcesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Food Safety Knowledge Base",
    "description": "Guides and regulations for HACCP compliance."
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <JSONLD data={structuredData} />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Food Safety Knowledge Base</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Everything you need to understand HACCP, compliance, and audit readiness.
          </p>
          
          <ResourceContent />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Scientific Context Section */}
        <section className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-16 mt-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="flex flex-col lg:flex-row items-start gap-12 relative z-10">
            <div className="p-5 bg-green-50 rounded-2xl text-green-600 shadow-sm border border-green-100 flex-shrink-0">
                <ShieldCheck className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight italic uppercase">Expert Editorial Integrity</h2>
              <p className="text-slate-600 mb-8 leading-relaxed text-lg font-medium">
                Our knowledge base is curated by lead auditors and food microbiologists. Every article is cross-referenced with Codex Alimentarius and FDA guidelines to ensure operational accuracy.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <Citation 
                  source="Codex" 
                  title="General Principles of Food Hygiene" 
                  link="https://www.fao.org/fao-who-codexalimentarius"
                />
                <Citation 
                  source="FSMA" 
                  title="FDA Preventive Controls for Human Food" 
                  link="https://www.fda.gov/food"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Citation({ source, title, link }: any) {
  return (
    <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-white hover:shadow-lg transition-all group">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border text-sm font-black text-slate-900 shadow-sm group-hover:scale-110 transition-transform">
        {source}
      </div>
      <div>
        <p className="font-black text-slate-900 text-sm uppercase tracking-wider">{source}</p>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
      </div>
    </a>
  );
}