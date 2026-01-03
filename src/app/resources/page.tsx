/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookOpen, FileText, HelpCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { articles } from '@/data/articles';

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
        {/* Articles Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {articles.map((article) => (
            <ArticleCard 
              key={article.slug}
              slug={article.slug}
              category={article.category}
              title={article.title}
              excerpt={article.excerpt}
              readTime={article.readTime}
            />
          ))}
        </div>

        {/* Scientific Context Section */}
        <section className="bg-white rounded-2xl shadow-sm border p-8 md:p-12 mb-16">
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

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQ 
              q="Is an AI-generated HACCP plan legal?" 
              a="Yes, provided it accurately reflects your actual operations. The law requires a plan based on HACCP principles; the tool (AI or pen/paper) doesn't matter. However, verification by a qualified person is always recommended."
            />
            <FAQ 
              q="Do I need to sign up to generate a plan?" 
              a="You can draft your plan completely for free. To download the final professional PDF and save your progress, a free account is required."
            />
            <FAQ 
              q="What if my menu changes?" 
              a="Our platform allows you to edit your plan at any time. Simply log in, update your ingredients or steps, and re-generate the hazard analysis instantly."
            />
            <FAQ 
              q="Does this cover me for local health inspections?" 
              a="Our output is designed to meet international standards (Codex). Most local health authorities align with these principles. We recommend our Professional Review addon for guaranteed local compliance."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ArticleCard({ title, excerpt, category, readTime, slug }: any) {
  return (
    <Link href={`/resources/${slug}`} className="group block bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">{category}</span>
        <span className="text-xs text-slate-400">{readTime}</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-slate-500 text-sm line-clamp-3">{excerpt}</p>
      <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
        Read Article <FileText className="w-4 h-4 ml-2" />
      </div>
    </Link>
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

function FAQ({ q, a }: any) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
        {q}
      </h3>
      <p className="text-slate-600 ml-8">{a}</p>
    </div>
  );
}
