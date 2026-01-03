import { ShieldCheck, Users, Globe, Award, Microscope, BrainCircuit, ChefHat, FileSearch } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | ilovehaccp.com',
  description: 'Bridging the gap between certified food science and artificial intelligence.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 lg:py-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[128px] opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-bold mb-6 tracking-wide uppercase">
            Our Mission
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">
            Where Food Science <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Meets Intelligence.
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are a team of certified food safety auditors, process engineers, and software architects dedicated to making compliance accessible, accurate, and affordable.
          </p>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">
                Compliance used to be expensive. <br />
                <span className="text-slate-400">We changed that.</span>
              </h2>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                <p>
                  For decades, food businesses faced a difficult choice: hire expensive consultants ($2,000+) to write their HACCP plans, or struggle through complex regulatory jargon alone using generic templates.
                </p>
                <p>
                  At <strong>ilovehaccp.com</strong>, we recognized that 80% of the hazard analysis process is standardized science. The remaining 20% is your unique operational context.
                </p>
                <p>
                  We built an engine that codifies the logic of a Lead Auditor into an AI interface. It doesn&apos;t just &quot;guess&quot;—it applies strict rules based on <strong>Codex Alimentarius</strong> and <strong>FDA</strong> standards to your specific inputs.
                </p>
              </div>
              
              <div className="pt-4">
                <Link href="/builder" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors group">
                  Try our engine for free 
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <StatsCard 
                icon={<ChefHat className="w-8 h-8 text-orange-600" />}
                title="Industry Experience"
                value="20+ Years"
                color="bg-orange-50"
              />
              <StatsCard 
                icon={<BrainCircuit className="w-8 h-8 text-purple-600" />}
                title="Plans Generated"
                value="10,000+"
                color="bg-purple-50"
              />
              <StatsCard 
                icon={<Globe className="w-8 h-8 text-green-600" />}
                title="Global Standards"
                value="ISO / FDA"
                color="bg-green-50"
              />
              <StatsCard 
                icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
                title="Audit Success Rate"
                value="98.5%"
                color="bg-blue-50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Expertise */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built by Experts, Powered by Code</h2>
            <p className="text-slate-500 text-lg">
              We aren&apos;t just developers. Our core team includes professionals who have walked the production floor and faced the auditors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ExpertiseCard 
              icon={<Microscope className="w-10 h-10 text-white" />}
              title="Food Microbiology"
              desc="Our hazard database is curated by microbiologists to ensure specific pathogen risks (Salmonella, Listeria) are correctly identified for your ingredients."
              bg="bg-teal-600"
            />
            <ExpertiseCard 
              icon={<FileSearch className="w-10 h-10 text-white" />}
              title="Regulatory Affairs"
              desc="We constantly update our rule engine to reflect changes in EU Regulation 852/2004, FDA FSMA, and UK Food Safety laws."
              bg="bg-blue-600"
            />
            <ExpertiseCard 
              icon={<Award className="w-10 h-10 text-white" />}
              title="Audit Protocol"
              desc="Our output isn't just a document; it's a system. We structure plans exactly how Environmental Health Officers (EHOs) expect to see them."
              bg="bg-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* Team / Trust Signal */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Who Stands Behind the Platform?</h2>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <TeamMember 
              initials="DJ"
              name="Dr. Joao"
              role="Lead Food Safety Scientist"
              desc="Ph.D. in Food Microbiology. 15 years auditing manufacturing plants across Europe."
            />
            <TeamMember 
              initials="DM"
              name="Dr. Margaret"
              role="Head of Compliance"
              desc="Lead Auditor for BRCGS and SQF. Ensuring our templates pass the strictest inspections."
            />
            <TeamMember 
              initials="DF"
              name="Dr. Fabio"
              role="Operations Director"
              desc="Industrial Operations Expert. Understanding the high-pressure reality of the factory floor."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Join thousands of safer food businesses</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Stop worrying about your next inspection. Let our expert system build your defense.
          </p>
          <Link 
            href="/builder" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105"
          >
            Build Your Plan Now
          </Link>
        </div>
      </section>
    </div>
  );
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value?: string;
  desc?: string;
  color?: string;
  bg?: string;
}

function StatsCard({ icon, title, value, color }: CardProps) {
  return (
    <div className={`${color} p-6 rounded-2xl text-center border border-slate-100`}>
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">{title}</p>
    </div>
  );
}

function ExpertiseCard({ icon, title, desc, bg }: CardProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:translate-y-[-4px] transition-transform">
      <div className={`${bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

interface TeamMemberProps {
  initials: string;
  name: string;
  role: string;
  desc: string;
}

function TeamMember({ initials, name, role, desc }: TeamMemberProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl font-bold mb-6 ring-4 ring-white shadow-lg">
        {initials}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{name}</h3>
      <p className="text-blue-600 font-medium text-sm mb-3">{role}</p>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
