import { ClipboardCheck, Sparkles, FileCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    icon: <ClipboardCheck className="w-8 h-8 text-blue-600" />,
    title: "1. Enter Product Details",
    desc: "Tell us what you make and how. Our smart wizard guides you through identifying your key ingredients and processes."
  },
  {
    icon: <Sparkles className="w-8 h-8 text-purple-600" />,
    title: "2. AI Identifies Hazards",
    desc: "Our engine cross-references your inputs with global food safety databases to spot biological, chemical, and physical risks."
  },
  {
    icon: <FileCheck className="w-8 h-8 text-green-600" />,
    title: "3. Get Your Plan",
    desc: "Download a fully compliant HACCP document, complete with Critical Control Points (CCPs) and monitoring forms."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
            Simple Process
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">How It Works</h2>
          <p className="text-xl text-slate-500 font-medium">
            Go from blank page to fully compliant in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10"></div>

          {steps.map((step, i) => (
            <div key={i} className="relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group text-center">
              <div className="w-20 h-20 bg-white rounded-2xl border-2 border-slate-50 shadow-lg flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform relative z-10">
                {step.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link 
            href="/builder" 
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl hover:-translate-y-1"
          >
            Start Your Plan Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
