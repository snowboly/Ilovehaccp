"use client";

import { UserCheck, ShieldCheck } from 'lucide-react';

const experts = [
  {
    name: "Dr. Joao",
    role: "PhD in Food Microbiology",
    bio: "Scientific Lead specializing in pathogen control and molecular safety protocols.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao&gender=male",
    badge: "Scientific Lead"
  },
  {
    name: "Dr. Margaret",
    role: "Lead Auditor (BRCGS/SQF)",
    bio: "20+ years ensuring global compliance. Margaret&apos;s templates are built to pass the strictest inspections.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Margaret&gender=female",
    badge: "Compliance"
  },
  {
    name: "Dr. Fabio",
    role: "Industrial Operations Expert",
    bio: "Bridging the gap between academic theory and the high-pressure reality of the factory floor.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fabio&gender=male",
    badge: "Operations"
  },
  {
    name: "Dr. Claudia",
    role: "Food Science Professor",
    bio: "Educator and researcher focusing on emerging food safety technologies and preservation methods.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Claudia&gender=female",
    badge: "Research"
  },
  {
    name: "Dr. Elizabeth",
    role: "Regulatory Specialist",
    bio: "Expert in FDA FSMA and EU Regulation 852/2004, ensuring legal alignment across borders.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elizabeth&gender=female",
    badge: "Legal"
  }
];

export default function ExpertAdvisors() {
  const topRow = experts.slice(0, 3);
  const bottomRow = experts.slice(3, 5);

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
            Our AI models are trained on the direct knowledge and experience of industry veterans, ensuring your plans aren&apos;t just generated—they&apos;re engineered for compliance.
          </p>
        </div>

        {/* Experts Layout */}
        <div className="space-y-8">
          {/* Top Row (3 members) */}
          <div className="grid md:grid-cols-3 gap-8">
            {topRow.map((expert, idx) => (
              <ExpertCard key={idx} expert={expert} />
            ))}
          </div>

          {/* Bottom Row (2 members centered) */}
          <div className="flex flex-col md:flex-row justify-center gap-8">
            {bottomRow.map((expert, idx) => (
              <div key={idx} className="w-full md:w-[calc(33.333%-1.33rem)]">
                <ExpertCard expert={expert} />
              </div>
            ))}
          </div>
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

function ExpertCard({ expert }: { expert: typeof experts[0] }) {
  return (
    <div className="group relative bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:-translate-y-1 h-full">
      {/* Image */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg mx-auto transform group-hover:scale-110 transition-transform duration-500 bg-white">
          <img src={expert.image} alt={expert.name} className="w-full h-full object-contain" />
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
          &quot;{expert.bio}&quot;
        </p>
      </div>

      {/* Verification Tick */}
      <div className="absolute top-6 right-6 text-slate-300 group-hover:text-blue-500 transition-colors">
        <UserCheck className="w-6 h-6" />
      </div>
    </div>
  );
}