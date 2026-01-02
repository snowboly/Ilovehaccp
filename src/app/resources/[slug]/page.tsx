import { articles } from '@/data/articles';
import { ArrowLeft, Calendar, Clock, Tag, UserCheck, ChevronRight, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  
  if (!article) return { title: 'Article Not Found' };

  return {
    title: `${article.title} | ilovehaccp.com`,
    description: article.excerpt,
  };
}

// Simple parser to extract headings for the Table of Contents
function getHeadings(html: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  // Match both <h2> and <h3>
  const regex = /<(h[23])>(.*?)<\/h[23]>/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]*>?/gm, ''); // Remove any nested tags
    const id = text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    headings.push({
      id,
      text,
      level: match[1] === 'h2' ? 2 : 3
    });
  }
  return headings;
}

// Function to inject IDs into headings so they can be linked
function injectHeaderIds(html: string) {
  return html.replace(/<(h[23])>(.*?)<\/h[23]>/g, (match, tag, text) => {
    const id = text.replace(/<[^>]*>?/gm, '').toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    return `<${tag} id="${id}">${text}</${tag}>`;
  });
}

// Persona data mapping (matching scripts/generate_expert_article.js)
const PERSONAS: Record<string, any> = {
    "Sarah Jenkins": {
        role: "Lead Auditor for BRCGS and SQF",
        bio: "Sarah is a veteran compliance officer with over 15 years in international food safety standards. She specializes in audit-readiness and technical documentation for high-risk food facilities.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150"
    },
    "Dr. Eleanor Vance": {
        role: "PhD in Food Microbiology and Safety",
        bio: "Dr. Vance is a researcher and professor focused on the molecular biology of foodborne pathogens. She consults with global health organizations to establish preventive food safety protocols.",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&h=150"
    },
    "Marcus Thorne": {
        role: "Veteran Food Plant Operations Director",
        bio: "With 30 years in the field, Marcus has managed some of the largest food manufacturing facilities in the UK. He focuses on the practical bridge between scientific HACCP and operational reality.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150"
    }
};

function getExpertFromContent(content: string) {
    if (content.includes("Sarah Jenkins")) return PERSONAS["Sarah Jenkins"];
    if (content.includes("Dr. Eleanor Vance")) return PERSONAS["Dr. Eleanor Vance"];
    if (content.includes("Marcus Thorne")) return PERSONAS["Marcus Thorne"];
    return null;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) notFound();

  const headings = getHeadings(article.content);
  const processedContent = injectHeaderIds(article.content);
  const expert = getExpertFromContent(article.content);
  const isExpertArticle = article.readTime === '45 min read';

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Top Progress Bar (Placeholder for client component) */}
      <div className="fixed top-0 left-0 w-full h-1 bg-blue-100 z-50">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: '0%' }}></div>
      </div>

      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/resources" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <span className="text-slate-400">Section: <strong>Introduction</strong></span>
            <Link href="/builder" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-all">
              Build HACCP Plan
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: Sidebar ToC (Desktop only) */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin">
            <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold uppercase text-xs tracking-widest">
              <Bookmark className="w-4 h-4 text-blue-600" />
              Table of Contents
            </div>
            <nav className="space-y-1">
              {headings.length > 0 ? (
                headings.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    className={`block py-2 text-sm transition-colors border-l-2 pl-4 hover:border-blue-400 hover:text-blue-600 ${
                      h.level === 3 ? 'ml-4 text-slate-400 font-normal border-transparent' : 'text-slate-600 font-semibold border-slate-100'
                    }`}
                  >
                    {h.text}
                  </a>
                ))
              ) : (
                <span className="text-slate-400 text-sm">Navigation pending...</span>
              )}
            </nav>
          </aside>

          {/* MAIN ARTICLE */}
          <main className="flex-1 min-w-0">
            <header className="mb-12">
              <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-bold uppercase tracking-widest">
                <span className="bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> {article.category}
                </span>
                <span className="text-slate-400 flex items-center gap-1.5 border border-slate-200 px-3 py-1.5 rounded-md bg-white">
                  <Clock className="w-3.5 h-3.5" /> {article.readTime}
                </span>
                <span className="text-slate-400 flex items-center gap-1.5 border border-slate-200 px-3 py-1.5 rounded-md bg-white">
                  <Calendar className="w-3.5 h-3.5" /> {article.publishedAt}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-8">
                {article.title}
              </h1>
              
              <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 mb-10">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <p className="text-lg text-slate-700 italic font-medium leading-relaxed">
                  "{article.excerpt}"
                </p>
              </div>

              {/* Expert Profile (Top) */}
              {isExpertArticle && expert && (
                <div className="flex items-center gap-4 py-8 border-y border-slate-100 mb-12">
                    <img src={expert.image} alt={expert.role} className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg" />
                    <div>
                        <p className="text-sm text-blue-600 font-bold uppercase tracking-wide mb-0.5">Article Expert</p>
                        <h4 className="text-xl font-black text-slate-900 leading-none mb-1">Written by Expert Advisor</h4>
                        <p className="text-slate-500 font-medium">{expert.role}</p>
                    </div>
                </div>
              )}
            </header>

            {/* Scientific Depth Alert for Expert Articles */}
            {isExpertArticle && (
                <div className="mb-12 p-6 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/30 transition-all"></div>
                    <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center rotate-3 shadow-xl">
                        <Bookmark className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-xl font-bold mb-1 italic uppercase tracking-wider">Expert Editorial Analysis</h4>
                        <p className="text-slate-300 leading-relaxed"> This high-authority guide is written to BRCGS/FDA standards. It covers molecular safety, operational reality, and lead-auditor expectations. Recommended for Quality Managers and Business Owners.</p>
                    </div>
                </div>
            )}

            <div 
              className="prose prose-lg md:prose-xl prose-slate max-w-none 
                         prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
                         prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:pb-4 prose-h2:border-b prose-h2:border-slate-100
                         prose-h3:text-2xl prose-h3:mt-10
                         prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:mb-8
                         prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-4 prose-ul:mb-10
                         prose-li:text-slate-600
                         prose-strong:text-slate-900 prose-strong:font-bold
                         prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:pr-6 prose-blockquote:rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Detailed Bio (Bottom) */}
            {isExpertArticle && expert && (
                <div className="mt-20 p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                    <img src={expert.image} alt={expert.role} className="w-24 h-24 rounded-2xl object-cover shadow-xl ring-4 ring-white" />
                    <div>
                        <h5 className="text-2xl font-black text-slate-900 mb-2">About the Contributor</h5>
                        <p className="text-slate-600 leading-relaxed mb-4">{expert.bio}</p>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1 text-xs font-bold text-blue-600 uppercase tracking-widest"><UserCheck className="w-4 h-4" /> Verified Expert</span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest">Updated {article.publishedAt}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA */}
            <div className="mt-24 mb-12 p-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] shadow-2xl shadow-blue-500/20">
                <div className="bg-white rounded-[2.2rem] px-8 py-16 text-center overflow-hidden relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -mt-32"></div>
                    <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 max-w-2xl mx-auto relative z-10">
                        {article.category === 'Compliance' || article.category === 'Fundamentals'
                        ? 'Stop guessing. Build your BRC-compliant HACCP plan in 10 minutes.'
                        : 'Get an expert 1-on-1 review of your food safety management system.'}
                    </h3>
                    <Link 
                        href={article.category === 'Compliance' || article.category === 'Fundamentals' ? "/builder" : "/contact"} 
                        className="relative z-10 inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-6 rounded-2xl text-xl font-black shadow-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                    >
                        {article.category === 'Compliance' || article.category === 'Fundamentals' 
                        ? 'Generate My HACCP Plan' 
                        : 'Book Expert Consultation'}
                        <ChevronRight className="w-6 h-6" />
                    </Link>
                    <p className="mt-8 text-slate-400 font-bold uppercase tracking-widest text-xs relative z-10">
                        No Credit Card Required • Industry Standard • Export PDF
                    </p>
                </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}