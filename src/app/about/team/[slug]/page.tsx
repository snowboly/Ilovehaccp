import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, FileText, ArrowLeft, Award, Briefcase } from 'lucide-react';
import { TeamAvatar } from '@/components/team/TeamAvatars';
import JSONLD from '@/components/layout/JSONLD';
import { articles as localArticles } from '@/data/articles';

// Team member data with full details for E-E-A-T
const TEAM_MEMBERS = {
  "dr-joao": {
    name: "Dr. Joao",
    slug: "dr-joao",
    role: "Scientific Lead & Founder",
    badge: "Founder",
    bio: "The scientific visionary behind our tool logic.",
    fullBio: "Dr. Joao is the founder and scientific lead of iLoveHACCP. With extensive expertise in microbial pathogenesis and predictive modeling, he has dedicated his career to making food safety compliance accessible and scientifically rigorous for businesses of all sizes.",
    credentials: "PhD in Food Science",
    expertise: [
      "Microbial pathogenesis",
      "Predictive modeling in food safety",
      "HACCP system design",
      "Risk assessment methodologies"
    ],
    image: "/team/joao.svg",
    articleKeyword: "Dr. Joao"
  },
  "dr-margarida": {
    name: "Dr. Margarida",
    slug: "dr-margarida",
    role: "Head of Compliance",
    badge: "Compliance",
    bio: "Overseeing EU & UK regulatory alignment and audit standards.",
    fullBio: "Dr. Margarida leads compliance operations at iLoveHACCP, ensuring every generated plan meets the strictest BRCGS/SQF criteria. Her deep knowledge of EU and UK food safety regulations makes her invaluable in navigating the complex regulatory landscape.",
    credentials: "PhD in Food Safety",
    expertise: [
      "EU & UK food safety regulations",
      "BRCGS/SQF certification",
      "Regulatory compliance auditing",
      "EC 852/2004 implementation"
    ],
    image: "/team/margarida.svg",
    articleKeyword: "Dr. Margarida"
  },
  "dr-fabio": {
    name: "Dr. Fabio",
    slug: "dr-fabio",
    role: "Lead Auditor",
    badge: "Auditor",
    bio: "Ensuring practical applicability and audit readiness on the factory floor.",
    fullBio: "Dr. Fabio brings years of hands-on auditing experience to iLoveHACCP. He specializes in translating complex regulations into practical, implementable procedures that work on the factory floor while meeting the highest audit standards.",
    credentials: "Certified Lead Auditor",
    expertise: [
      "Food safety auditing",
      "Gap analysis",
      "Corrective action implementation",
      "Audit preparation and readiness"
    ],
    image: "/team/fabio.svg",
    articleKeyword: "Dr. Fabio"
  },
  "dr-claudia": {
    name: "Dr. Claudia",
    slug: "dr-claudia",
    role: "Technical Lead",
    badge: "Technical",
    bio: "Driving the technological innovation behind our hazard analysis engine.",
    fullBio: "Dr. Claudia leads the technical development at iLoveHACCP, focusing on the intersection of food science and machine learning. Her work ensures our hazard analysis engine is both scientifically accurate and technologically advanced.",
    credentials: "PhD in Food Technology",
    expertise: [
      "Machine learning in food safety",
      "Hazard analysis automation",
      "Food technology innovation",
      "Algorithm development"
    ],
    image: "/team/claudia.svg",
    articleKeyword: "Dr. Claudia"
  },
  "dr-isabel": {
    name: "Dr. Isabel",
    slug: "dr-isabel",
    role: "Head of Ops",
    badge: "Operations",
    bio: "Managing operational excellence and customer success frameworks.",
    fullBio: "Dr. Isabel oversees operational excellence at iLoveHACCP. Her expertise in workflow optimization for multi-site food operations ensures our platform delivers exceptional value to businesses ranging from single restaurants to large food conglomerates.",
    credentials: "Operations Excellence Specialist",
    expertise: [
      "Multi-site operations management",
      "Customer success frameworks",
      "Workflow optimization",
      "Quality management systems"
    ],
    image: "/team/isabel.svg",
    articleKeyword: "Dr. Isabel"
  }
};

type TeamMemberSlug = keyof typeof TEAM_MEMBERS;

export async function generateStaticParams() {
  return Object.keys(TEAM_MEMBERS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const member = TEAM_MEMBERS[slug as TeamMemberSlug];

  if (!member) {
    return { title: 'Team Member Not Found' };
  }

  return {
    title: `${member.name} - ${member.role} | iLoveHACCP Team`,
    description: `${member.fullBio} Learn about ${member.name}'s expertise in ${member.expertise.slice(0, 2).join(' and ')}.`,
    alternates: {
      canonical: `https://www.ilovehaccp.com/about/team/${slug}`
    },
    openGraph: {
      title: `${member.name} - ${member.role}`,
      description: member.fullBio,
      url: `https://www.ilovehaccp.com/about/team/${slug}`,
      type: 'profile'
    }
  };
}

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = TEAM_MEMBERS[slug as TeamMemberSlug];

  if (!member) {
    notFound();
  }

  // Find articles written by this team member
  const memberArticles = localArticles.filter(article =>
    article.content.includes(member.articleKeyword)
  ).slice(0, 6);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // BreadcrumbList
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.ilovehaccp.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About",
            "item": "https://www.ilovehaccp.com/about"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": member.name
          }
        ]
      },
      // Person Schema
      {
        "@type": "Person",
        "name": member.name,
        "jobTitle": member.role,
        "description": member.fullBio,
        "image": `https://www.ilovehaccp.com${member.image}`,
        "url": `https://www.ilovehaccp.com/about/team/${slug}`,
        "worksFor": {
          "@type": "Organization",
          "name": "iLoveHACCP",
          "url": "https://www.ilovehaccp.com"
        },
        "knowsAbout": member.expertise,
        "hasCredential": {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": member.credentials
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <JSONLD data={structuredData} />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-xs font-sans text-slate-500">
          <Link href="/" className="hover:underline text-blue-600">Home</Link>
          <span>›</span>
          <Link href="/about" className="hover:underline text-blue-600">About</Link>
          <span>›</span>
          <span className="text-slate-700">{member.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Link */}
        <Link href="/about" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to About
        </Link>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-xl bg-slate-50">
              <TeamAvatar name={member.name} className="w-full h-full object-contain" />
            </div>
            <div className="mt-3 text-center">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider">
                {member.badge}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-black text-slate-900 mb-2">{member.name}</h1>
            <p className="text-xl text-blue-600 font-bold mb-4">{member.role}</p>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <Award className="w-4 h-4" />
              <span>{member.credentials}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg">
              {member.fullBio}
            </p>
          </div>
        </div>

        {/* Expertise Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Areas of Expertise
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {member.expertise.map((area, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-slate-700 font-medium">{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Articles Section */}
        {memberArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Articles by {member.name}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/resources/${article.slug}`}
                  className="block p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                    {article.category}
                  </span>
                  <h3 className="text-slate-900 font-bold mt-1 line-clamp-2 leading-tight">
                    {article.title}
                  </h3>
                  <span className="text-xs text-slate-400 mt-2 block">{article.readTime}</span>
                </Link>
              ))}
            </div>
            {memberArticles.length >= 6 && (
              <div className="mt-6 text-center">
                <Link href="/resources" className="text-blue-600 hover:underline font-medium">
                  View all articles →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-8 bg-slate-900 rounded-2xl text-center">
          <h3 className="text-2xl font-black text-white mb-4">
            Ready to create your HACCP plan?
          </h3>
          <p className="text-slate-300 mb-6">
            Our expert-designed system helps you build compliant plans in minutes.
          </p>
          <Link
            href="/builder"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            Start Free Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
