import { BookOpen, ShieldCheck } from 'lucide-react';
import { articles } from '@/data/articles';
import { faqs } from '@/data/faqs';
import ResourceTabs from '@/components/resources/ResourceTabs';
import { Suspense } from 'react';

export const metadata = {
  title: 'HACCP Resources & Knowledge Base | ilovehaccp.com',
  description: 'Expert guides, FAQs, and scientific context for food safety compliance.',
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Food Safety Knowledge Base</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Everything you need to understand HACCP, compliance, and audit readiness.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        
        {/* Dynamic Content Tabs */}
        <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-400">Loading resources...</div>}>
          <ResourceTabs articles={articles} faqs={faqs} />
        </Suspense>

        {/* Scientific Context Section */}
        <section className="bg-white rounded-2xl shadow-sm border p-8 md:p-12 mt-16">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Scientific Basis</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Our AI models are trained on globally recognized food safety standards. The hazard analysis engine correlates specific ingredients with known epidemiological risks.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Citation 
                  source="Codex Alimentarius" 
                  title="General Principles of Food Hygiene (CXC 1-1969)" 
                  link="https://www.fao.org/fao-who-codexalimentarius"
                />
                <Citation 
                  source="FDA" 
                  title="Hazard Analysis and Risk-Based Preventive Controls" 
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
    <a href={link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border hover:border-blue-300 transition-colors">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border text-xs font-bold text-slate-700">
        {source.substring(0, 3)}
      </div>
      <div>
        <p className="font-bold text-slate-900 text-sm">{source}</p>
        <p className="text-slate-500 text-xs">{title}</p>
      </div>
    </a>
  );
}

