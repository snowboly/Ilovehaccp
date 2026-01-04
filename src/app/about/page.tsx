import { ShieldCheck, Globe, Award, Microscope, BrainCircuit, ChefHat, FileSearch, Quote, Heart, Target, Lightbulb, Users, BarChart, Search, Wrench, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | ilovehaccp.com',
  description: 'Bridging the gap between certified food science and artificial intelligence.',
};

const team = [
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

export default function AboutPage() {
  const topRow = team.slice(0, 3);
  const bottomRow = team.slice(3, 5);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Hero Section (Introduction) */}
      <section className="bg-slate-50 border-b border-slate-100 py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter">
            About <span className="text-blue-600">Us.</span>
          </h1>
          <div className="max-w-3xl space-y-6">
            <p className="text-2xl text-slate-600 font-medium leading-relaxed">
                At ilovehaccp.com, our mission is to democratize food safety compliance by making it clear, achievable, and automated for food businesses worldwide.
            </p>
            <p className="text-lg text-slate-500 leading-relaxed">
                We bridge the gap between rigorous scientific standards and operational reality. By combining the speed of Artificial Intelligence with the rigour of certified Lead Auditors, we empower businesses—from local restaurants to industrial processors—with strategic solutions that safeguard public health and business continuity.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Leadership Insights (Quotes) */}
      <section className="py-24 border-b border-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Dr. Joao Perspective */}
            <div className="space-y-8">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center rotate-3 shadow-xl mb-10">
                    <Quote className="w-10 h-10 text-white fill-white" />
                </div>
                <blockquote className="text-3xl font-black text-slate-900 leading-tight tracking-tight italic">
                    &quot;Regulatory compliance isn&apos;t just a legal requirement—it&apos;s the foundation of business excellence and a unique opportunity for growth.&quot;
                </blockquote>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                        <img src={team[0].image} alt={team[0].name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-lg">{team[0].name}</p>
                        <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">Scientific Lead & Founder</p>
                    </div>
                </div>
            </div>

            {/* Dr. Margaret Perspective */}
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <blockquote className="text-2xl font-bold leading-relaxed mb-10 relative z-10">
                    &quot;Our goal is to optimize regulatory workflows, reducing implementation costs by 80% while enhancing the precision of hazard analysis across the supply chain.&quot;
                </blockquote>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/10 bg-white/5">
                        <img src={team[1].image} alt={team[1].name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-lg">{team[1].name}</p>
                        <p className="text-blue-400 font-bold text-sm uppercase tracking-wider">Head of Global Operations</p>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Our Pillars (Icons Grid) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12">
            <PillarCard 
                icon={<Target className="w-8 h-8" />}
                title="PRECISION"
                desc="Our AI is trained on Codex Alimentarius standards, ensuring every hazard is correctly identified at a molecular level."
            />
            <PillarCard 
                icon={<Lightbulb className="w-8 h-8" />}
                title="INNOVATION"
                desc="We constanty evolve our algorithms to reflect the latest in food technology and digital monitoring trends."
            />
            <PillarCard 
                icon={<Heart className="w-8 h-8" />}
                title="INTEGRITY"
                desc="Confidentiality is paramount. Your proprietary recipes and processes are never used to train public models."
            />
            <PillarCard 
                icon={<BarChart className="w-8 h-8" />}
                title="SCALABILITY"
                desc="From local bakeries to multi-site industrial plants, our systems adapt to your operational complexity."
            />
            <PillarCard 
                icon={<Search className="w-8 h-8" />}
                title="AUDIT READINESS"
                desc="Plans are structured specifically to meet the expectations of Environmental Health Officers and Lead Auditors."
            />
            <PillarCard 
                icon={<Wrench className="w-8 h-8" />}
                title="PRACTICALITY"
                desc="We bridge the gap between academic theory and the daily pressure of food service and manufacturing."
            />
          </div>
        </div>
      </section>

      {/* 4. The Expert Team */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
              <Users className="w-4 h-4" /> Global Expert Network
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Who Stands Behind the Platform?</h2>
            <p className="text-lg text-slate-500 font-medium">
              A multidisciplinary team of scientists, auditors, and operation experts dedicated to your success.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              {topRow.map((expert, idx) => (
                <ExpertCard key={idx} expert={expert} />
              ))}
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-8">
              {bottomRow.map((expert, idx) => (
                <div key={idx} className="w-full md:w-[calc(33.333%-1.33rem)]">
                  <ExpertCard expert={expert} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Metrics & Achievements */}
      <section className="py-24 border-y border-slate-100 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <MetricItem value="10,000+" label="Active HACCP Plans" />
            <MetricItem value="99.8%" label="Audit Pass Rate" />
            <MetricItem value="45+" label="Countries Supported" />
            <MetricItem value="24/7" label="Cloud Availability" />
          </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">We can assist you in your regulatory and quality needs.</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
                href="/contact" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl text-xl font-black transition-all shadow-xl hover:shadow-blue-500/20 flex items-center justify-center gap-2"
            >
                <Mail className="w-6 h-6" />
                Contact us today to learn more
            </Link>
            <Link 
                href="/builder" 
                className="bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl text-xl font-black transition-all shadow-xl flex items-center justify-center gap-2"
            >
                Start Free Plan
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function PillarCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="space-y-4">
            <div className="w-12 h-12 text-blue-600 flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
                {desc}
            </p>
        </div>
    );
}

function ExpertCard({ expert }: { expert: typeof team[0] }) {
    return (
      <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:-translate-y-1 h-full">
        <div className="relative mb-8 text-center">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-50 shadow-lg mx-auto transform group-hover:scale-110 transition-transform duration-500 bg-slate-50">
            <img src={expert.image} alt={expert.name} className="w-full h-full object-contain" />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-widest shadow-md">
            {expert.badge}
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-slate-900 mb-1">{expert.name}</h3>
          <p className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-wide">{expert.role}</p>
          <p className="text-slate-500 leading-relaxed text-sm font-medium">
            &quot;{expert.bio}&quot;
          </p>
        </div>
        <div className="absolute top-6 right-6 text-slate-200 group-hover:text-blue-500 transition-colors">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>
    );
}

function MetricItem({ value, label }: { value: string, label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tighter">{value}</div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{label}</p>
        </div>
    );
}