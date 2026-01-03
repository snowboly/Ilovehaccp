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
        {/* Beta Banner */}
        <div className="bg-indigo-600 text-white text-center py-3 px-4 font-medium text-sm flex justify-center items-center gap-2">
          <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">Beta Launch</span>
          <span>We are currently in public beta. All features (including PDF export) are <strong>free</strong> for a limited time!</span>
        </div>

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
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/builder" className="bg-blue-600 hover:bg-blue-700 text-white text-center px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl hover:translate-y-[-2px]">
                    Build Your Plan Free
                  </Link>
                  <button 
                    onClick={() => {
                        // We will trigger a hidden sample download
                        const btn = document.getElementById('download-sample-trigger');
                        btn?.click();
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-center px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2"
                  >
                    Download Sample PDF
                  </button>
                </div>
                <div className="flex gap-6 text-sm text-slate-500 font-medium pt-4">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card required</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Instant PDF export</span>
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
                      <p className="text-xs text-slate-500">ISO 22000 Compliant</p>
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

        <ExpertAdvisors />

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
              {/* Free Tier - Preview */}
              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 hover:border-slate-600 transition-colors flex flex-col">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">HACCP Preview</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold">€0</span>
                  </div>
                  <p className="text-slate-400 mt-4 text-sm">For assessing risks and process flow only.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> Limited Wizard Access
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> Draft Process Flow
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> High-Level Hazard List
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-500">
                    <X className="w-5 h-5" /> No Critical Limits
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-500">
                    <X className="w-5 h-5" /> No PDF Download
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-500">
                    <X className="w-5 h-5" /> Not Audit-Ready
                  </li>
                </ul>
                <Link href="/builder" className="w-full py-4 rounded-xl border border-slate-600 hover:bg-slate-700 font-bold text-center transition-colors">
                  Start Preview
                </Link>
              </div>

              {/* Starter Tier */}
              <div className="bg-blue-600 rounded-3xl p-8 border-2 border-blue-400 shadow-2xl relative flex flex-col transform scale-105 z-10">
                <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Standard Review
                </div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">Starter Review</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold">€79</span>
                    <span className="text-blue-200 ml-2">+ VAT</span>
                  </div>
                  <p className="text-blue-100 mt-4 text-sm">AI Plan + Expert Review for standard businesses.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm font-bold">
                    <CheckCircle2 className="w-5 h-5 text-white" /> Full Wizard Access
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-white" /> Complete HACCP Plan
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-white" /> PDF Export Included
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-white" /> Expert Review Included
                  </li>
                  <li className="flex items-center gap-3 text-sm text-blue-200">
                    <CheckCircle2 className="w-5 h-5 text-white" /> Audit Support
                  </li>
                </ul>
                <Link href="/builder" className="w-full py-4 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-center transition-colors shadow-lg">
                  Get Started
                </Link>
              </div>

              {/* Professional Tier */}
              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 hover:border-slate-600 transition-colors flex flex-col">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">Expert Pro</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold">Custom</span>
                  </div>
                  <p className="text-slate-400 mt-4 text-sm">For complex, multi-site, or industrial operations requiring bespoke solutions.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> Everything in Starter
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> Dedicated Consultant
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> Multi-site Management
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> On-site Audit Options
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-yellow-400">
                    <CheckCircle2 className="w-5 h-5" /> Priority Support
                  </li>
                </ul>
                <Link href="/contact" className="w-full py-4 rounded-xl border border-slate-600 hover:bg-slate-700 font-bold text-center transition-colors">
                  Contact Sales
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
