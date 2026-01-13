import { BookOpen, ShieldCheck } from 'lucide-react';
import ResourceContent from '@/components/resources/ResourceContent';
import IndustryDirectory from '@/components/resources/IndustryDirectory';
import JSONLD from '@/components/layout/JSONLD';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { articles as localArticles } from '@/data/articles';

export const metadata: Metadata = {
  title: 'Food Safety Knowledge Base | HACCP Guides & Regulations',
  description: 'Everything you need to understand HACCP, compliance, and audit readiness. Expert-curated articles on food microbiology and safety protocols.',
  alternates: { canonical: 'https://www.ilovehaccp.com/resources' }
};

export default async function ResourcesPage() {
  // Server-side fetch for SEO
  const { data: dbArticles } = await supabase
    .from('articles')
    .select('slug, title, category, excerpt, read_time, image, published_at')
    .order('created_at', { ascending: false });

  const allArticles = dbArticles && dbArticles.length > 0 ? dbArticles : localArticles;

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
          
          <ResourceContent initialArticles={allArticles} />
        </div>
      </div>

      <IndustryDirectory articles={allArticles} />

      <div className="container mx-auto px-4 pb-12">
        {/* Regulatory Mapping & Standards */}
        <section className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-16 mt-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start gap-8 mb-12">
              <div className="p-5 bg-blue-50 rounded-2xl text-blue-600 shadow-sm border border-blue-100 flex-shrink-0">
                  <ShieldCheck className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Regulatory Standards & Mapping</h2>
                <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-3xl">
                  Our system logic is rigorously mapped to EU and UK regulatory frameworks. We provide direct access to the source texts for full transparency.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Direct Regulation Links */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Source Regulations</h3>
                <Citation 
                  source="EU" 
                  title="Regulation (EC) No 852/2004" 
                  desc="On the hygiene of foodstuffs. Mandatory for all food business operators in the European Union."
                  link="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32004R0852"
                />
                <Citation 
                  source="UK" 
                  title="Retained Reg (EC) 852/2004" 
                  desc="UK retained law on food hygiene. Mirrors EU standards post-Brexit."
                  link="https://www.legislation.gov.uk/eur/2004/852/contents"
                />
                <Citation 
                  source="Codex" 
                  title="CXC 1-1969 (2020 Revision)" 
                  desc="General Principles of Food Hygiene. The foundational baseline for HACCP systems."
                  link="https://www.fao.org/fao-who-codexalimentarius/sh-proxy/en/?lnk=1&url=https%253A%252F%252Fworkspace.fao.org%252Fsites%252Fcodex%252FStandards%252FCXC%2B1-1969%252FCXC_001e.pdf"
                />
              </div>

              {/* Mapping Table */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">How Our Plans Map to Regulations</h3>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-xs">
                      <tr>
                        <th className="p-4 border-b border-slate-200">HACCP Principle</th>
                        <th className="p-4 border-b border-slate-200">EC 852/2004 Ref.</th>
                        <th className="p-4 border-b border-slate-200">Tool Output</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-4 font-medium text-slate-900">1. Hazard Analysis</td>
                        <td className="p-4 text-slate-600">Art. 5(2)(a)</td>
                        <td className="p-4 text-slate-600">Section 3.0: Detailed hazard tables (Bio/Chem/Phys).</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-slate-900">2. CCP Identification</td>
                        <td className="p-4 text-slate-600">Art. 5(2)(b)</td>
                        <td className="p-4 text-slate-600">CCP Decision Tree logic applied to every step.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-slate-900">3. Critical Limits</td>
                        <td className="p-4 text-slate-600">Art. 5(2)(c)</td>
                        <td className="p-4 text-slate-600">Validated limits (e.g., &gt;75°C) in Section 4.0.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-slate-900">4-5. Monitoring & Corrective</td>
                        <td className="p-4 text-slate-600">Art. 5(2)(d-e)</td>
                        <td className="p-4 text-slate-600">Specific procedures & 'If/Then' actions.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-medium text-slate-900">6-7. Verification & Records</td>
                        <td className="p-4 text-slate-600">Art. 5(2)(f-g)</td>
                        <td className="p-4 text-slate-600">Audit logs & review schedules included.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Citation({ source, title, desc, link }: any) {
  return (
    <a href={link} target="_blank" rel="noreferrer" className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-white hover:shadow-lg transition-all group h-full">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border text-xs font-black text-slate-900 shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
        {source}
      </div>
      <div>
        <p className="font-black text-slate-900 text-sm uppercase tracking-wider mb-1">{title}</p>
        <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
      </div>
    </a>
  );
}