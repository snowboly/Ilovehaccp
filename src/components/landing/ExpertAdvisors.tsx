"use client";

import { CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

const experts = [
  {
    name: "Dr. Eleanor Vance",
    role: "PhD in Food Microbiology",
    bio: "Former FSA consultant specializing in pathogen control and molecular safety protocols.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=300&h=300",
    badge: "Scientific Lead"
  },
  {
    name: "Sarah Jenkins",
    role: "Lead Auditor (BRCGS/SQF)",
    bio: "15+ years auditing high-risk facilities. Sarah ensures our templates pass the strictest inspections.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300",
    badge: "Compliance"
  },
  {
    name: "Marcus Thorne",
    role: "Operations Director",
    bio: "30-year veteran managing industrial food plants. He bridges the gap between theory and factory floor reality.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300",
    badge: "Operations"
  }
];

export default function ExpertAdvisors() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 border border-blue-100">
            <ShieldCheck className="w-4 h-4" /> Trusted Authority
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            Built by AI. <br className="hidden md:block" />
            <span className="text-blue-600">Verified by Experts.</span>
          </h2>
          <p className="text-xl text-slate-500 leading-relaxed">
            Our AI models are trained on the direct knowledge and experience of industry veterans, ensuring your plans aren't just generated—they're engineered for compliance.
          </p>
        </div>

        {/* Experts Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {experts.map((expert, idx) => (
            <div key={idx} className="group relative bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:-translate-y-1">
              
              {/* Image */}
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg mx-auto transform group-hover:scale-110 transition-transform duration-500">
                  <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-widest shadow-md">
                  {expert.badge}
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-900 mb-1">{expert.name}</h3>
                <p className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-wide">{expert.role}</p>
                <p className="text-slate-500 leading-relaxed text-sm">
                  "{expert.bio}"
                </p>
              </div>

              {/* Verification Tick */}
              <div className="absolute top-6 right-6 text-slate-300 group-hover:text-blue-500 transition-colors">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-100 pt-12">
            {[
                { label: "Active Plans", value: "10,000+" },
                { label: "Audits Passed", value: "99.8%" },
                { label: "Countries", value: "45+" },
                { label: "Compliance Rate", value: "100%" }
            ].map((stat, i) => (
                <div key={i} className="text-center">
                    <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
