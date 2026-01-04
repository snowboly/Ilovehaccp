"use client";

import Link from 'next/link';
import { 
  Clock, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  X,
  Gavel,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import InteractiveDemo from '@/components/landing/InteractiveDemo';
import ExpertAdvisors from '@/components/landing/ExpertAdvisors';
import Testimonials from '@/components/landing/Testimonials';
import BlogPreview from '@/components/landing/BlogPreview';
import Newsletter from '@/components/landing/Newsletter';
import SampleDownload from '@/components/landing/SampleDownload';

export default function Home() {
  return (
    <div className="font-sans">
      <main className="flex-1 pt-20">
        <SampleDownload />

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
            <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-400 opacity-20 blur-[120px]"></div>
          </div>
          
          <div className="container px-4 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
                  <Star className="w-4 h-4 fill-blue-700" />
                  Rated #1 AI Food Safety Tool
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
                  HACCP Plans <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Done in Minutes.
                  </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                  Stop wrestling with Word documents. Our AI consultant generates audit-ready food safety plans tailored to your menu, customized to your region.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Link href="/builder" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-center px-10 py-5 rounded-2xl text-xl font-black transition-all shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                    Build Your Plan Free
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                                  <UserCheck className="w-4 h-4 text-blue-600" />
                              </div>
                          ))}
                      </div>
                      <div className="text-sm">
                          <p className="font-black text-slate-900 leading-none">Audit Ready</p>
                          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Validated Logic</p>
                      </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-8 text-sm text-slate-400 font-bold uppercase tracking-[0.2em] pt-4 grayscale opacity-60">
                  <span className="flex items-center gap-2">FDA Compliant</span>
                  <span className="flex items-center gap-2">EU 852/2004</span>
                  <span className="flex items-center gap-2">Codex CXC 1-1969</span>
                </div>
              </div>
              
              <div className="relative">
                <InteractiveDemo />
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -left-10 bg-white p-4 rounded-xl shadow-lg border animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Audit Ready</p>
                      <p className="text-xs text-slate-500">Industry Standard</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white text-slate-900">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl font-bold mb-4">Why Food Businesses Love Us</h2>
              <p className="text-lg text-slate-500">
                We combine the speed of Artificial Intelligence with the rigour of Codex Alimentarius standards.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Clock className="w-6 h-6" />,
                  title: "Lightning Fast",
                  desc: "What used to take 2 weeks now takes 20 minutes. Answer our smart questionnaire and get a full plan instantly."
                },
                {
                  icon: <Gavel className="w-6 h-6" />,
                  title: "Global Compliance",
                  desc: "Whether you're under FDA, EU, or UK regulations, our system adapts the hazard analysis to your region."
                },
                {
                  icon: <UserCheck className="w-6 h-6" />,
                  title: "Expert Verification",
                  desc: "AI does the heavy lifting, but our certified food safety experts provide the final stamp of approval."
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors text-slate-900">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Regulatory Integrity Section */}
        <section className="py-20 bg-slate-50 border-y border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <div className="container px-4 mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight italic uppercase">
                  Rigorous Compliance. <br />
                  <span className="text-blue-600">Zero Shortcuts.</span>
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed font-medium mb-10">
                  Our AI intelligence engine isn't just generating text—it's executing a logical risk assessment based on the global gold standards of food safety.
                </p>
                
                <div className="grid gap-6">
                  {[{
                    "title": "Codex Alimentarius",
                    "desc": "Logic mapped to the CXC 1-1969 General Principles of Food Hygiene."
                  }, {
                    "title": "FDA FSMA",
                    "desc": "Hazard analysis aligned with 21 CFR 117 preventive control requirements."
                  }, {
                    "title": "EU 852/2004",
                    "desc": "Framework compliance for European food business operators."
                  }].map((item, i) => (
                    <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase tracking-wider text-sm mb-1">{item.title}</h4>
                        <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100 flex items-center justify-center text-center">
                   <div className="space-y-6">
                      <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-900">Audit-Ready Logic</h3>
                      <p className="text-slate-500 font-medium">Every Critical Control Point (CCP) identified by our engine includes scientific critical limits and corrective actions verified for audit submission.</p>
                      <div className="pt-6">
                        <span className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">Validated for 2026</span>
                      </div>
                   </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="container px-4 mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Choose Your Compliance Level</h2>
              <p className="text-lg text-slate-400">
                From a quick readiness check to a fully validated professional system.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Tier */}
              <div className="bg-slate-950 rounded-[2.5rem] p-8 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black text-white mb-2">Free Plan</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-white">€0</span>
                  </div>
                  <p className="text-slate-500 mt-4 text-sm font-medium leading-relaxed">Complete self-service plan generation.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Full Wizard Access
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Complete HACCP Plan
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Full Process Flow
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300 text-slate-500">
                    <X className="w-5 h-5 text-slate-700" /> No Professional Review
                  </li>
                </ul>
                <Link href="/builder" className="w-full py-4 rounded-xl bg-white text-slate-900 font-black text-center transition-all hover:bg-slate-100 shadow-xl">
                  Start Building
                </Link>
              </div>

              {/* Starter Review */}
              <div className="bg-blue-600 rounded-[2.5rem] p-8 border-2 border-blue-400 shadow-2xl relative flex flex-col transform lg:scale-110 z-10">
                <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em]">
                  Recommended
                </div>
                <div className="mb-8 pt-4">
                  <h3 className="text-xl font-black text-white mb-2">Starter Review</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-white">€79</span>
                    <span className="text-blue-200 ml-2 font-bold">+ VAT</span>
                  </div>
                  <p className="text-blue-100 mt-4 text-sm font-medium">Everything in Free + Professional Review.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm font-bold text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> Everything in Free
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> <strong>Editable Files</strong> (Word/Excel)
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" /> <strong>Basic Professional Review</strong>
                  </li>
                </ul>
                <Link href="/builder" className="w-full py-4 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-black text-center transition-all shadow-xl">
                  Get Started
                </Link>
              </div>

              {/* Strategic Enterprise */}
              <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-200 hover:border-amber-300 transition-all flex flex-col shadow-lg shadow-amber-900/5">
                <div className="mb-8">
                  <h3 className="text-xl font-black text-amber-900 mb-2">Strategic Enterprise</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-amber-900">Custom</span>
                  </div>
                  <p className="text-amber-700/70 mt-4 text-sm font-medium leading-relaxed">For complex, multi-site, or industrial operations.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-amber-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" /> <strong>Full HACCP Plan Review</strong>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-amber-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" /> On-site Audit Options
                  </li>
                  <li className="flex items-center gap-3 text-sm text-amber-800 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" /> Dedicated Consultant
                  </li>
                  <li className="flex items-center gap-3 text-sm text-amber-800 font-black">
                    <CheckCircle2 className="w-5 h-5 text-amber-500" /> Priority Support
                  </li>
                </ul>
                <Link href="/contact" className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-center transition-all shadow-lg shadow-amber-600/20">
                  Contact for Quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Testimonials />
        <BlogPreview />
        <Newsletter />

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
          <div className="container px-4 mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold mb-8">Ready to get compliant?</h2>
            <Link href="/builder" className="inline-block bg-white text-blue-600 px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-transform">
              Create Your Free Plan
            </Link>
            <p className="mt-6 text-blue-200">No credit card required. Cancel anytime.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
