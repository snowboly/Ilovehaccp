import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { CheckCircle2, AlertTriangle, BookOpen, FileCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import JSONLD from '@/components/layout/JSONLD';

export const metadata: Metadata = {
  title: 'HACCP Requirements in the UK & EU | Regulation 852/2004 Explained',
  description: 'A plain English guide to food safety laws in the UK and Europe. Understand Regulation (EC) 852/2004, what inspectors check, and who needs a HACCP plan.',
  alternates: { canonical: 'https://www.ilovehaccp.com/requirements-eu-uk' }
};

export default function PillarPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "HACCP Requirements in the UK & EU (Regulation 852/2004 Explained)",
    "description": "Comprehensive guide to food hygiene regulations for businesses in the UK and European Union.",
    "author": {
        "@type": "Organization",
        "name": "iLoveHACCP Compliance Team"
    },
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
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
          <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 block">Authoritative Guide • 2026 Edition</span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
            HACCP Requirements in the <span className="text-blue-600">UK & EU</span>
          </h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed mb-8">
            Regulation (EC) 852/2004 Explained in Plain English.
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-bold text-slate-600">
            <BookOpen className="w-4 h-4" /> 10 Minute Read
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        
        {/* Intro */}
        <div className="prose prose-lg prose-slate max-w-none mb-16">
          <p className="lead text-2xl font-medium text-slate-700">
            If you handle food in the UK or EU, you&apos;ve heard of HACCP. But reading the actual legal text of <strong>Regulation (EC) No 852/2004</strong> can be overwhelming. This guide strips away the jargon to explain exactly what is required of you by law.
          </p>
        </div>

        {/* Section 1: The Law */}
        <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">1. What the Law Actually Requires</h2>
          </div>
          <div className="prose prose-slate max-w-none">
            <p>
              The core regulation governing food hygiene in Europe (and retained in UK law post-Brexit) is <strong>Regulation (EC) No 852/2004</strong>. 
              Article 5 of this regulation states that food business operators must put in place, implement, and maintain a permanent procedure based on the <strong>HACCP principles</strong>.
            </p>
            <p>In plain English, this means you must:</p>
            <ul className="grid gap-2 mt-4">
                <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /> <strong>Identify Hazards:</strong> What could go wrong? (Bacteria, glass, allergens).</li>
                <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /> <strong>Identify CCPs:</strong> Where can you stop these hazards? (Cooking, chilling).</li>
                <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /> <strong>Set Limits:</strong> What is "safe"? (e.g., Cook to 75°C).</li>
                <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /> <strong>Monitor:</strong> Check that you are meeting these limits (Temperature logs).</li>
                <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /> <strong>Corrective Action:</strong> What do you do if something goes wrong? (Throw food away).</li>
                <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /> <strong>Verify:</strong> Prove the system works (Audits, fridge checks).</li>
                <li className="flex gap-3 items-start"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" /> <strong>Documentation:</strong> Write it all down.</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Who Needs It */}
        <section className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-6">2. Who Must Have a HACCP Plan?</h2>
            <div className="bg-slate-900 text-white rounded-[2rem] p-10 shadow-xl">
                <p className="text-2xl font-bold mb-6 text-center">Do you handle food?</p>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                        <h3 className="font-black text-emerald-400 text-lg mb-2 uppercase tracking-widest">YES, Required</h3>
                        <ul className="space-y-2 text-sm font-medium text-slate-200">
                            <li>• Restaurants & Cafes</li>
                            <li>• Takeaways & Food Trucks</li>
                            <li>• Bakeries & Butchers</li>
                            <li>• Food Manufacturers</li>
                            <li>• Home-based Caterers</li>
                            <li>• Warehouses storing perishable food</li>
                        </ul>
                    </div>
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                        <h3 className="font-black text-rose-400 text-lg mb-2 uppercase tracking-widest">Exceptions</h3>
                        <ul className="space-y-2 text-sm font-medium text-slate-200">
                            <li>• Primary production (Farming/Fishing) - *Though basic hygiene rules still apply*</li>
                            <li>• Preparation of food for private domestic consumption</li>
                        </ul>
                    </div>
                </div>
                <p className="text-center mt-8 text-slate-400 text-sm">
                    <strong>Rule of Thumb:</strong> If you sell food or give it away as part of a registered business/charity, you need a plan.
                </p>
            </div>
        </section>

        {/* Section 3: Inspection Checklist */}
        <section className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <FileCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">3. What Inspectors Actually Check</h2>
          </div>
          <div className="prose prose-slate max-w-none">
            <p>
              When an Environmental Health Officer (EHO) visits, they are looking for evidence of <strong>control</strong>. They don't just want to see a dusty binder on a shelf; they want to see it in action.
            </p>
            <div className="grid md:grid-cols-2 gap-6 not-prose mt-6">
                {[
                    { t: "Temperature Records", d: "Are fridge temps checked daily? Is there a gap in the log?" },
                    { t: "Staff Knowledge", d: "Can your chef explain critical cooking temps without looking at a poster?" },
                    { t: "Cleanliness", d: "Is there grease under the equipment? Are sanitizers BS EN 1276 compliant?" },
                    { t: "Allergen Matrix", d: "Is there an accurate, up-to-date matrix of allergens in your dishes?" },
                    { t: "Cross-Contamination", d: "Are raw and cooked foods separated (physically and by equipment)?" },
                    { t: "Pest Control", d: "Is there a contract in place? Are there gaps under doors?" }
                ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-900">{item.t}</h4>
                        <p className="text-sm text-slate-600 mt-1">{item.d}</p>
                    </div>
                ))}
            </div>
          </div>
        </section>

        {/* Section 4: Common Mistakes */}
        <section className="mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-6">4. Common Mistakes to Avoid</h2>
            <div className="space-y-4">
                <div className="flex gap-4 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-amber-900">Copying a Generic Template</h4>
                        <p className="text-amber-800 text-sm mt-1">Downloading a template and not changing it. If your plan says you check temperatures "every 2 hours" but you only do it twice a day, you fail.</p>
                    </div>
                </div>
                <div className="flex gap-4 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-amber-900">Ignoring "Safer Food, Better Business"</h4>
                        <p className="text-amber-800 text-sm mt-1">In the UK, the FSA provides the SFBB pack. It is excellent for small businesses. Ignoring it or leaving sections blank is a red flag.</p>
                    </div>
                </div>
                <div className="flex gap-4 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-amber-900">Over-complication</h4>
                        <p className="text-amber-800 text-sm mt-1">Creating 50 Critical Control Points (CCPs) when you only need 3. More paperwork isn't better; it's harder to maintain.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 5: The Solution (Soft Sell) */}
        <section className="bg-blue-600 rounded-[3rem] p-12 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h2 className="text-3xl font-black mb-4 relative z-10">Need a compliant plan without the headache?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto relative z-10 font-medium">
                Our free tool builds a custom HACCP plan based on your specific menu and equipment, strictly aligned with EU & UK regulations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Link 
                    href="/builder" 
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                    Build My Plan Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                    href="/resources" 
                    className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all border border-blue-500"
                >
                    Browse Industry Guides
                </Link>
            </div>
        </section>

      </div>
    </div>
  );
}
