import { supabase } from '@/lib/supabase';
import { articles as localArticles } from '@/data/articles';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JSONLD from '@/components/layout/JSONLD';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article;
  
  const { data } = await supabase.from('articles').select('title, excerpt').eq('slug', slug).single();
  if (data) {
    article = data;
  } else {
    article = localArticles.find(a => a.slug === slug);
  }

  if (!article) return { title: 'Article Not Found' };
  return { 
    title: `${article.title}`, 
    description: article.excerpt,
    alternates: { canonical: `https://www.ilovehaccp.com/resources/${slug}` }
  };
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
    
    // Match "References & Authors" style: font-serif, text-xl, font-normal
    const style = tag === 'h2' 
      ? 'border-bottom: 1px solid #a2a9b1; padding-bottom: 3px; margin-top: 2em; margin-bottom: 1em; font-family: serif; font-weight: 400; font-size: 1.25rem; color: #000;'
      : 'font-weight: bold; font-family: serif; margin-top: 1.5em; margin-bottom: 0.5em; color: #000; font-size: 1.1rem;';

    return `<${tag} id="${id}" style="${style}">${text}</${tag}>`;
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
  "Dr. Joao": {
    name: "Dr. Joao",
    slug: "dr-joao",
    role: "Scientific Lead & Founder",
    bio: "The scientific visionary behind our tool logic.",
    image: "/team/joao.svg",
    credentials: "PhD in Food Science, Expert in microbial pathogenesis and predictive modeling"
  },
  "Dr. Margarida": {
    name: "Dr. Margarida",
    slug: "dr-margarida",
    role: "Head of Compliance",
    bio: "Overseeing EU & UK regulatory alignment and audit standards.",
    image: "/team/margarida.svg",
    credentials: "PhD in Food Safety, Specialist in BRCGS/SQF certification requirements"
  },
  "Dr. Fabio": {
    name: "Dr. Fabio",
    slug: "dr-fabio",
    role: "Lead Auditor",
    bio: "Ensuring practical applicability and audit readiness on the factory floor.",
    image: "/team/fabio.svg",
    credentials: "Certified Lead Auditor, Expert in translating regulations into operational practice"
  },
  "Dr. Claudia": {
    name: "Dr. Claudia",
    slug: "dr-claudia",
    role: "Technical Lead",
    bio: "Driving the technological innovation behind our hazard analysis engine.",
    image: "/team/claudia.svg",
    credentials: "PhD in Food Technology, Specialist in food science and machine learning"
  },
  "Dr. Isabel": {
    name: "Dr. Isabel",
    slug: "dr-isabel",
    role: "Head of Ops",
    bio: "Managing operational excellence and customer success frameworks.",
    image: "/team/isabel.svg",
    credentials: "Expert in workflow optimization for multi-site food operations"
  }
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
  const dbSlugs = (articles || []).map((a) => ({ slug: a.slug }));
  const localSlugs = localArticles.map(a => ({ slug: a.slug }));
  const allSlugs = [...dbSlugs];
  localSlugs.forEach(ls => {
    if (!allSlugs.find(ds => ds.slug === ls.slug)) {
      allSlugs.push(ls);
    }
  });
  return allSlugs;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let article;
  const { data } = await supabase.from('articles').select('*').eq('slug', slug).single();
  
  if (data) {
    article = data;
  } else {
    article = localArticles.find(a => a.slug === slug);
  }

  if (!article) notFound();

  const headings = getHeadings(article.content);
  const processedContent = highlightListTerms(injectHeaderIds(article.content));
  const expert = getExpertFromContent(article.content);
  const isHighAuthority = article.content.length > 5000;

  // Calculate dateModified (use published date + 30 days as last review, or current date if recent)
  const publishedDate = article.published_at || article.publishedAt;
  const dateModified = publishedDate ? new Date(new Date(publishedDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // BreadcrumbList Schema
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
            "name": "Resources",
            "item": "https://www.ilovehaccp.com/resources"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": article.category,
            "item": `https://www.ilovehaccp.com/resources?category=${encodeURIComponent(article.category)}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": article.title
          }
        ]
      },
      // Article Schema with Enhanced Author
      {
        "@type": "Article",
        "headline": article.title,
        "description": article.excerpt,
        "image": article.image,
        "url": `https://www.ilovehaccp.com/resources/${slug}`,
        "datePublished": publishedDate,
        "dateModified": dateModified,
        "author": {
          "@type": "Person",
          "name": expert.name,
          "jobTitle": expert.role,
          "description": expert.credentials,
          "url": "https://www.ilovehaccp.com/about",
          "worksFor": {
            "@type": "Organization",
            "name": "iLoveHACCP",
            "url": "https://www.ilovehaccp.com"
          }
        },
        "publisher": {
          "@type": "Organization",
          "name": "iLoveHACCP",
          "url": "https://www.ilovehaccp.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.ilovehaccp.com/icon.svg"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://www.ilovehaccp.com/resources/${slug}`
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      <JSONLD data={structuredData} />
      
      {/* Wiki-style Header / Navbar substitute */}
      <div className="border-b border-slate-200 bg-slate-50/50">
        <div className="container mx-auto px-4 py-2 flex items-center gap-2 text-xs font-sans text-slate-500">
          <Link href="/" className="hover:underline text-blue-600">Main Page</Link>
          <span>›</span>
          <Link href="/resources" className="hover:underline text-blue-600">Resources</Link>
          <span>›</span>
          <span className="text-slate-700">{article.category}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          <main className="lg:w-3/4 min-w-0"> {/* min-w-0 fixes flex overflow */}
            <header className="mb-6 border-b border-slate-300 pb-4">
              <h1 className="font-serif text-3xl md:text-4xl font-normal text-black leading-tight mb-2 italic border-b-0 wiki-title">
                {article.title}
              </h1>
              <div className="text-sm text-slate-500 font-sans">
                From iLoveHACCP, the free encyclopedia of food safety.
              </div>
            </header>

            {/* Wiki-style warning/info banner if high authority */}
            {isHighAuthority && (
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 text-sm text-slate-800 flex gap-4 items-start">
                    <div className="mt-1 min-w-[20px] text-center font-serif font-bold text-slate-500">i</div>
                    <div className="italic">
                      &quot;{article.excerpt}&quot;
                    </div>
                </div>
            )}

            <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">
              {/* Main Content Column */}
              <div className="flex-1 min-w-0">
                 {/* TOC for Mobile */}
                 <div className="lg:hidden mb-8 p-3 bg-slate-50 border border-slate-200 inline-block rounded-sm min-w-[200px]">
                    <div className="font-sans font-bold text-center text-sm mb-2">Contents</div>
                    <nav className="text-xs space-y-1">
                      {headings.map((h, i) => (
                        <a key={i} href={`#${h.id}`} className={`block hover:underline text-blue-600 ${h.level === 3 ? 'pl-4' : 'pl-0'}`}>
                          <span className="text-slate-500 mr-1">{i + 1}</span> {h.text}
                        </a>
                      ))}
                    </nav>
                 </div>

                 <div 
                  className="prose prose-slate max-w-none font-sans text-[15px] leading-7 text-[#202122]
                    prose-headings:font-serif prose-headings:font-normal prose-headings:text-black
                    prose-h2:text-2xl prose-h2:border-b prose-h2:border-[#a2a9b1] prose-h2:pb-1 prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-lg prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-2
                    prose-p:my-3 prose-p:text-left
                    prose-a:text-[#3366cc] prose-a:no-underline hover:prose-a:underline
                    prose-ul:list-disc prose-ul:pl-5 prose-ul:my-3
                    prose-li:my-0.5
                    prose-img:my-6 prose-img:border prose-img:border-[#c8ccd1] prose-img:bg-[#f8f9fa] prose-img:p-1
                    prose-blockquote:border-l-4 prose-blockquote:border-slate-200 prose-blockquote:pl-4 prose-blockquote:text-slate-600 prose-blockquote:italic
                    prose-strong:font-bold prose-strong:text-black"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />

                {/* References / Author Section (Wiki Style) */}
                <div className="mt-12 pt-4 border-t border-slate-300">
                    <h2 className="font-serif text-xl font-normal border-b border-slate-300 pb-1 mb-4">References & Authors</h2>
                    <div className="text-sm text-slate-600">
                        <p className="mb-2">
                          This article was reviewed by{' '}
                          <Link href="/about" className="text-blue-600 hover:underline font-semibold">
                            {expert.name}
                          </Link>{' '}
                          ({expert.role}).
                        </p>
                        <p className="italic">{expert.bio}</p>
                        <p className="text-xs text-slate-500 mt-1">{expert.credentials}</p>
                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                          <span>Published: {publishedDate}</span>
                          <span>Last reviewed: {dateModified}</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Desktop Sidebar (TOC + Infobox) */}
              <aside className="hidden lg:block w-[300px] shrink-0 space-y-6">
                 {/* Infobox Image */}
                 {article.image && (
                    <div className="border border-slate-200 bg-slate-50 p-1 text-xs">
                      <img src={article.image} alt={article.title} className="w-full mb-2 bg-white" />
                      <div className="px-2 pb-1 text-slate-600 text-center leading-tight">
                        Figure 1: {article.title} visualization.
                      </div>
                    </div>
                  )}

                  {/* Desktop TOC */}
                  <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-4 text-sm rounded-sm">
                    <div className="font-sans font-bold text-center mb-3">Contents</div>
                    <nav className="space-y-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {headings.map((h, i) => (
                        <a key={i} href={`#${h.id}`} className={`block hover:underline text-[#3366cc] ${h.level === 3 ? 'pl-4 text-xs' : 'font-medium'}`}>
                          <span className="text-black inline-block w-4 mr-1">{i + 1}</span>{h.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                  
                  {/* CTA Box (Wiki style ad/box) */}
                  <div className="border border-[#a2a9b1] bg-blue-50/30 p-4 text-center">
                    <div className="font-serif font-bold text-sm mb-2">HACCP Plan Generator</div>
                    <p className="text-xs text-slate-600 mb-3">Create a compliant HACCP plan for your facility in minutes.</p>
                    <Link href="/builder" className="inline-block bg-[#3366cc] text-white px-4 py-1.5 text-sm font-bold rounded-sm hover:underline">Start Builder</Link>
                  </div>
              </aside>
            </div>
          </main>

          <aside className="lg:w-1/4 hidden lg:block border-l border-slate-200 pl-8">
             <div className="text-xs text-slate-500 font-sans uppercase tracking-widest mb-4">Related Topics</div>
             <ul className="space-y-2 text-sm">
                <li><Link href="/resources" className="text-[#3366cc] hover:underline">All Resources</Link></li>
                <li><Link href="/builder" className="text-[#3366cc] hover:underline">HACCP Builder Tool</Link></li>
                <li><Link href="/about" className="text-[#3366cc] hover:underline">About the Experts</Link></li>
             </ul>
          </aside>

        </div>
      </div>
    </div>
  );
}
