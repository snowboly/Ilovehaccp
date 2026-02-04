import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HACCP Explained: Step-by-Step Logic',
  description: 'A concise guide to HACCP logic applied step by step for clear, practical food safety plans.',
  alternates: { canonical: 'https://www.ilovehaccp.com/haccp-explainer' }
};

export default function HACCPExplainerPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            HACCP logic applied step by step
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            A clear sequence to turn your process into a practical, maintainable plan.
          </p>
        </div>

        <div className="grid gap-4 mb-10">
          {[
            'Scope: Define products, processes, and flow in plain terms.',
            'Hazards: Identify what could go wrong at each step.',
            'Controls: Describe practical controls and monitoring points.',
            'Records: Capture actions, checks, and updates in one place.'
          ].map((item, index) => (
            <div key={index} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <p className="text-slate-700 font-semibold">{item}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/builder"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-white font-black shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
          >
            See how it works
          </Link>
        </div>
      </div>
    </div>
  );
}
