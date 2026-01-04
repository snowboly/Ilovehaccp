import { supabase } from '@/lib/supabase';
import { Calendar, Clock, UserCheck, ChevronRight, Bookmark, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: article } = await supabase.from('articles').select('title, excerpt').eq('slug', slug).single();
  if (!article) return { title: 'Article Not Found' };
  return { title: `${article.title} | ilovehaccp.com`, description: article.excerpt };
}

function getHeadings(html: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /<(h[23])>(.*?)<\/h[23]>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]*>?/gm, '');
    const id = text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    headings.push({ id, text, level: match[1] === 'h2' ? 2 : 3 });
  }
  return headings;
}

function injectHeaderIds(html: string) {
  return html.replace(/<(h[23])>(.*?)<\/h[23]>/g, (match, tag, text) => {
    const id = text.replace(/<[^>]*>?/gm, '').toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    return `<${tag} id="${id}">${text}</${tag}>`;
  });
}

function highlightListTerms(html: string) {
  return html.replace(/<li>\s*(?:<strong>)?(.*?)(?:<\/strong>)?\s*:\s*([\s\S]*?)\s*<\/li>/g, (match, term, desc) => {
    const cleanTerm = term.replace(/<[^>]+>/g, '').trim();
    const cleanDesc = desc.trim();
    return `<li class="mb-8"><span class="block font-black text-slate-900 text-xl mb-2">${cleanTerm}:</span><span class="block pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-black before:text-xl">${cleanDesc}</span></li>`;
  });
}

const PERSONAS: Record<string, any> = {
    "Dr. Joao": { role: "PhD in Food Microbiology", bio: "Dr. Joao is a leading expert in microbiological food safety.", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao" },
    "Dr. Margarida": { role: "Lead Auditor (BRCGS/SQF)", bio: "Dr. Margarida is a veteran compliance officer with over 20 years of experience.", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Margarida" },
    "Dr. Fabio": { role: "Industrial Operations Expert", bio: "Dr. Fabio bridges the gap between complex theory and factory-floor implementation.", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fabio" },
    "Dr. Claudia": { role: "Food Science Professor", bio: "Dr. Claudia focuses on emerging preservation technologies.", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Claudia" },
    "Dr. Isabel": { role: "Regulatory Compliance Specialist", bio: "Dr. Isabel is an expert in FDA FSMA and EU Food Law.", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabel" }
};

function getExpertFromContent(content: string) {
    if (content.includes("Dr. Joao")) return PERSONAS["Dr. Joao"];
    if (content.includes("Dr. Margarida")) return PERSONAS["Dr. Margarida"];
    if (content.includes("Dr. Fabio")) return PERSONAS["Dr. Fabio"];
    if (content.includes("Dr. Claudia")) return PERSONAS["Dr. Claudia"];
    if (content.includes("Dr. Isabel")) return PERSONAS["Dr. Isabel"];
    return PERSONAS["Dr. Joao"];
}

export async function generateStaticParams() {
  const { data: articles } = await supabase.from('articles').select('slug');
  return (articles || []).map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: article } = await supabase.from('articles').select('*').eq('slug', slug).single();
  if (!article) notFound();

  const headings = getHeadings(article.content);
  const processedContent = highlightListTerms(injectHeaderIds(article.content));
  const expert = getExpertFromContent(article.content);
  const isHighAuthority = article.content.length > 5000;

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/resources" className="hover:text-blue-600">Resources</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 truncate">{article.category}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
          <main className="lg:w-2/3">
            <header className="mb-10">
              <div className="text-blue-600 font-black uppercase tracking-widest text-sm mb-4">{article.category}</div>
              <h1 className="font-serif text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-y border-slate-100 py-4 mb-10 font-medium">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{article.read_time}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{article.published_at}</span></div>
                <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-600" /><span className="font-bold text-slate-900">Expert Reviewed</span></div>
              </div>
              {article.image && (
                <figure className="mb-12">
                  <img src={article.image} alt={article.title} className="w-full rounded-xl shadow-sm max-h-[500px] object-cover" />
                </figure>
              )}
            </header>

            {isHighAuthority && (
                <div className="mb-12 p-10 bg-slate-50 border-l-8 border-blue-600 rounded-r-3xl">
                    <h4 className="font-serif text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">Technical Abstract</h4>
                    <p className="text-slate-700 text-xl leading-relaxed font-medium italic">&quot;{article.excerpt}&quot;</p>
                </div>
            )}

            <div 
              className="prose prose-lg md:prose-xl max-w-none font-serif prose-headings:text-slate-900 prose-h2:text-3xl md:prose-h2:text-5xl prose-h2:mt-32 prose-h2:mb-12 prose-h2:pb-8 prose-h2:border-b-4 prose-h2:border-slate-900 prose-h2:before:content-['ANALYSIS_UNIT'] prose-h2:before:block prose-h2:before:text-[11px] prose-h2:before:text-blue-600 prose-h2:before:tracking-[0.5em] prose-h2:before:font-sans prose-h2:before:mb-4 prose-p:leading-[2.0] prose-ul:list-none prose-ul:pl-0 prose-blockquote:border-l-8 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/50 prose-blockquote:py-10 prose-blockquote:px-12"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            <div className="mt-20 p-10 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-10 items-center">
                <img src={expert.image} alt={expert.role} className="w-24 h-24 rounded-full object-cover shadow-lg ring-4 ring-blue-50" />
                <div>
                    <h5 className="font-serif text-2xl font-black text-slate-900 mb-3">About the Author</h5>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium text-lg">{expert.bio}</p>
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{expert.role}</span>
                </div>
            </div>
          </main>

          <aside className="lg:w-1/3 space-y-12">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <div className="text-slate-900 font-serif font-black text-2xl border-b-2 border-slate-900 pb-2 mb-6">Table of Contents</div>
              <nav className="space-y-4">
                {headings.map((h, i) => (
                  <a key={i} href={`#${h.id}`} className={`block text-base transition-all border-l-2 pl-4 hover:text-blue-700 ${h.level === 3 ? 'ml-4 text-slate-500 italic' : 'text-slate-800 font-bold font-serif'}`}>{h.text}</a>
                ))}
              </nav>
              <div className="mt-10 pt-10 border-t border-slate-100 text-center">
                <Link href="/builder" className="block w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg hover:scale-[1.02] transition-all">Generate Free Plan</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
