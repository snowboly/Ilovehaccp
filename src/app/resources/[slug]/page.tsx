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

    // Modern Editorial style: bold sans-serif, no borders, clean spacing
    const style = tag === 'h2'
      ? 'margin-top: 2.5rem; margin-bottom: 1rem; font-family: system-ui, -apple-system, sans-serif; font-weight: 700; font-size: 1.5rem; color: #0f172a; letter-spacing: -0.025em;'
      : 'margin-top: 2rem; margin-bottom: 0.75rem; font-family: system-ui, -apple-system, sans-serif; font-weight: 600; font-size: 1.125rem; color: #1e293b;';

    return `<${tag} id="${id}" style="${style}">${text}</${tag}>`;
  });
}

function highlightListTerms(html: string) {
  return html.replace(/<li>\s*(?:<strong>)?(.*?)(?:<\/strong>)?\s*:\s*([\s\S]*?)\s*<\/li>/g, (match, term, desc) => {
    const cleanTerm = term.replace(/<[^>]+>/g, '').trim();
    const cleanDesc = desc.trim();
    return `<li class="mb-4 pl-0 list-none">
      <span class="font-semibold text-slate-900">${cleanTerm}:</span>
      <ul class="mt-2 ml-4"><li class="text-slate-600">${cleanDesc}</li></ul>
    </li>`;
  });
}

function transformBlockquotes(html: string) {
  // Transform blockquotes into styled callout boxes
  return html.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (match, content) => {
    const contentText = content.replace(/<[^>]+>/g, '').trim();

    // Determine callout type and icon based on content
    let icon = '💡';
    let bgColor = 'bg-blue-50';
    let borderColor = 'border-blue-200';
    let labelColor = 'text-blue-700';
    let label = 'Expert Insight';

    if (contentText.toLowerCase().includes('audit')) {
      icon = '📋';
      bgColor = 'bg-amber-50';
      borderColor = 'border-amber-200';
      labelColor = 'text-amber-700';
      label = 'Audit Tip';
    } else if (contentText.toLowerCase().includes('warning') || contentText.toLowerCase().includes('critical') || contentText.toLowerCase().includes('important')) {
      icon = '⚠️';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      labelColor = 'text-red-700';
      label = 'Important';
    } else if (contentText.toLowerCase().includes('leadership') || contentText.toLowerCase().includes('strategy')) {
      icon = '🎯';
      bgColor = 'bg-purple-50';
      borderColor = 'border-purple-200';
      labelColor = 'text-purple-700';
      label = 'Leadership Insight';
    } else if (contentText.toLowerCase().includes('science') || contentText.toLowerCase().includes('research') || contentText.toLowerCase().includes('study')) {
      icon = '🔬';
      bgColor = 'bg-emerald-50';
      borderColor = 'border-emerald-200';
      labelColor = 'text-emerald-700';
      label = 'Research Note';
    }

    // Clean the content
    let cleanContent = content
      .replace(/<strong>\s*(Audit Tip|Leadership Insight|Expert Note|Warning|Important):\s*<\/strong>/gi, '')
      .replace(/^\s*(Audit Tip|Leadership Insight|Expert Note|Warning|Important):\s*/gi, '')
      .trim();

    return `<div class="my-6 p-5 ${bgColor} ${borderColor} border rounded-lg not-prose">
      <div class="flex items-start gap-3">
        <span class="text-xl flex-shrink-0">${icon}</span>
        <div>
          <div class="font-semibold ${labelColor} text-sm mb-1">${label}</div>
          <div class="text-slate-700 text-[15px] leading-relaxed">${cleanContent}</div>
        </div>
      </div>
    </div>`;
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
  const processedContent = transformBlockquotes(highlightListTerms(injectHeaderIds(article.content)));
  const expert = getExpertFromContent(article.content);

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

      {/* Modern breadcrumb header */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="text-slate-300">/</span>
          <Link href="/resources" className="hover:text-blue-600 transition-colors">Resources</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 font-medium">{article.category}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16">

          <main className="lg:w-3/4 min-w-0">
            {/* Modern Editorial Header */}
            <header className="mb-8 max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                  {article.category}
                </span>
                <span className="text-slate-400 text-sm">{article.readTime}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-slate-900 leading-tight tracking-tight mb-4">
                {article.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {article.excerpt}
              </p>
            </header>

            <div className="flex flex-col-reverse lg:flex-row gap-8 items-start">
              {/* Main Content Column */}
              <div className="flex-1 min-w-0 max-w-3xl">
                 {/* Hero image */}
                 {article.image && (
                   <figure className="mb-10 lg:hidden">
                     <img src={article.image} alt={article.title} className="w-full rounded-xl shadow-sm" />
                   </figure>
                 )}

                 {/* TOC for Mobile */}
                 <div className="lg:hidden mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="font-semibold text-slate-900 text-sm mb-3">In this article</div>
                    <nav className="text-sm space-y-2">
                      {headings.filter(h => h.level === 2).map((h, i) => (
                        <a key={i} href={`#${h.id}`} className="block text-slate-600 hover:text-blue-600 transition-colors">
                          {h.text}
                        </a>
                      ))}
                    </nav>
                 </div>

                 {/* Article Content - Modern Editorial Style */}
                 <div
                  className="prose prose-slate max-w-none
                    prose-p:text-[17px] prose-p:leading-[1.8] prose-p:text-slate-700 prose-p:my-5
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-0
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2 prose-h4:font-semibold
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                    prose-ul:my-6 prose-ul:pl-0 prose-ul:list-none
                    prose-li:text-[17px] prose-li:leading-[1.8] prose-li:text-slate-700 prose-li:my-2 prose-li:pl-6 prose-li:relative
                    prose-li:before:content-[''] prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[0.7em] prose-li:before:w-1.5 prose-li:before:h-1.5 prose-li:before:bg-blue-500 prose-li:before:rounded-full
                    prose-ol:my-6 prose-ol:pl-0 prose-ol:list-none prose-ol:counter-reset-[item]
                    prose-img:rounded-xl prose-img:shadow-sm prose-img:my-8
                    prose-strong:font-semibold prose-strong:text-slate-900
                    prose-code:text-sm prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-slate-800
                    prose-hr:my-10 prose-hr:border-slate-200"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />

                {/* Author Card - Modern Style */}
                <div className="mt-16 p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-4">
                      <img src={expert.image} alt={expert.name} className="w-16 h-16 rounded-full bg-white shadow-sm" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Written by</div>
                        <Link href="/about" className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                          {expert.name}
                        </Link>
                        <div className="text-sm text-slate-600 mt-1">{expert.role}</div>
                        <p className="text-sm text-slate-500 mt-2">{expert.credentials}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>Published: {publishedDate}</span>
                      <span>Last reviewed: {dateModified}</span>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to build your HACCP plan?</h3>
                  <p className="text-sm text-slate-600 mb-4">Create a compliant, audit-ready HACCP plan for your food business in minutes.</p>
                  <Link href="/builder" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Start Building
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </div>
              </div>

              {/* Desktop Sidebar - Modern Sticky TOC */}
              <aside className="hidden lg:block w-[280px] shrink-0">
                <div className="sticky top-8 space-y-6">
                   {/* Hero image for desktop */}
                   {article.image && (
                      <div className="rounded-xl overflow-hidden shadow-sm">
                        <img src={article.image} alt={article.title} className="w-full" />
                      </div>
                    )}

                    {/* Desktop TOC - Modern Style */}
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl">
                      <div className="font-semibold text-slate-900 text-sm mb-4">In this article</div>
                      <nav className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {headings.filter(h => h.level === 2).map((h, i) => (
                          <a key={i} href={`#${h.id}`} className="block text-sm text-slate-600 hover:text-blue-600 transition-colors py-1 border-l-2 border-transparent hover:border-blue-600 pl-3 -ml-px">
                            {h.text}
                          </a>
                        ))}
                      </nav>
                    </div>

                    {/* Related Links */}
                    <div className="text-sm">
                      <div className="font-semibold text-slate-900 mb-3">Related</div>
                      <ul className="space-y-2">
                        <li><Link href="/resources" className="text-slate-600 hover:text-blue-600 transition-colors">All Resources</Link></li>
                        <li><Link href="/builder" className="text-slate-600 hover:text-blue-600 transition-colors">HACCP Builder Tool</Link></li>
                        <li><Link href="/about" className="text-slate-600 hover:text-blue-600 transition-colors">About the Experts</Link></li>
                      </ul>
                    </div>
                </div>
              </aside>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

