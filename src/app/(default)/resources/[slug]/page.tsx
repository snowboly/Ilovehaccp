import { supabase } from '@/lib/supabase';
import { articles as localArticles, Article } from '@/data/articles';
import { notFound } from 'next/navigation';
import JSONLD from '@/components/layout/JSONLD';
import { getAvatarUrl } from '@/components/team/TeamAvatars';
import ArticleLayout from '@/components/resources/ArticleLayout';

// Get related articles by category (excluding current)
function getRelatedArticles(currentSlug: string, category: string, limit: number = 3): Article[] {
  return localArticles
    .filter(a => a.category === category && a.slug !== currentSlug)
    .slice(0, limit);
}

// Generate FAQs from article content
function generateFAQs(title: string, content: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];

  // Extract H2/H3 headings and their following paragraphs as Q&A
  const sectionRegex = /<h[23][^>]*>([^<]+)<\/h[23]>\s*<p>([^<]+)<\/p>/gi;
  let match;
  let count = 0;

  while ((match = sectionRegex.exec(content)) !== null && count < 5) {
    const heading = match[1].trim();
    const paragraph = match[2].trim();

    // Skip if too short or generic
    if (paragraph.length < 50 || heading.toLowerCase().includes('introduction')) continue;

    // Convert heading to question format
    let question = heading;
    if (!heading.endsWith('?')) {
      if (heading.toLowerCase().startsWith('how') ||
          heading.toLowerCase().startsWith('what') ||
          heading.toLowerCase().startsWith('why') ||
          heading.toLowerCase().startsWith('when')) {
        question = heading + '?';
      } else {
        question = `What is ${heading.toLowerCase()}?`;
      }
    }

    faqs.push({ question, answer: paragraph.slice(0, 300) + (paragraph.length > 300 ? '...' : '') });
    count++;
  }

  // Add a generic FAQ about the topic if we don't have enough
  if (faqs.length < 3) {
    faqs.push({
      question: `Why is ${title.toLowerCase()} important for food safety?`,
      answer: `Understanding ${title.toLowerCase()} is essential for maintaining food safety standards, ensuring regulatory compliance, and protecting consumers from foodborne illnesses.`
    });
  }

  return faqs;
}

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
    return `<${tag} id="${id}">${text}</${tag}>`;
  });
}

function normalizeContent(html: string) {
  return html.replace(/\\'/g, "'").replace(/\\"/g, '"');
}

function fixWhatYoullLearn(html: string) {
  // Fix malformed "What you'll learn" sections that are plain text instead of lists
  // Pattern: <h4>What you'll learn</h4> followed by plain text lines (not in <ul>)
  return html.replace(
    /<h4>What you[''']ll learn<\/h4>\s*(?!<ul>)([\s\S]*?)(?=<h[234]>|<p>(?![A-Z][a-z]+\s+(?:and|or|the|a)\s))/gi,
    (match, content) => {
      // Split content into lines and filter out empty ones
      const lines = content
        .replace(/<\/?p>/g, '\n')
        .split(/\n/)
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 10 && !line.startsWith('<'));

      if (lines.length === 0) return match;

      const listItems = lines.map((line: string) => `<li>${line}</li>`).join('\n');
      return `<h4>What you'll learn</h4>\n<ul>\n${listItems}\n</ul>\n`;
    }
  );
}

function removeBoilerplate(html: string) {
  let cleaned = html;

  // Remove generic "Introduction to X" sections that just restate the title
  cleaned = cleaned.replace(
    /<h[23]>Introduction to [^<]+<\/h[23]>\s*<p>[^<]*(?:HACCP|Hazard Analysis)[^<]*(?:crucial|essential|important|vital)[^<]*<\/p>/gi,
    ''
  );

  // Remove repetitive HACCP principle conclusions
  cleaned = cleaned.replace(
    /<p>As we conclude[^<]*(?:HACCP|Hazard Analysis)[^<]*reiterate[^<]*<\/p>/gi,
    ''
  );
  cleaned = cleaned.replace(
    /<p>By adopting a proactive and science-based methodology[^<]*<\/p>/gi,
    ''
  );
  cleaned = cleaned.replace(
    /<p>A thorough understanding of the HACCP principles[^<]*<\/p>/gi,
    ''
  );
  cleaned = cleaned.replace(
    /<p>By doing so,[^<]*minimize the risk[^<]*<\/p>/gi,
    ''
  );
  cleaned = cleaned.replace(
    /<p>In light of these findings[^<]*<\/p>/gi,
    ''
  );

  // Remove in-content CTAs (we have a CTA card at the bottom)
  cleaned = cleaned.replace(
    /<p>[^<]*(?:Use our free HACCP builder|ilovehaccp\.com|generate your plan today)[^<]*<\/p>/gi,
    ''
  );

  // Remove "In summary, the key takeaways" paragraphs (redundant with Key Takeaways section)
  cleaned = cleaned.replace(
    /<p>In summary, the key takeaways[^<]*<\/p>/gi,
    ''
  );

  // Remove generic concluding statements about commitment/reputation
  cleaned = cleaned.replace(
    /<p>By embracing these principles[^<]*customer satisfaction[^<]*<\/p>/gi,
    ''
  );

  // Remove "Further Reading & Tools" section (h3 + p + ul)
  cleaned = cleaned.replace(
    /<h3>Further Reading (?:&amp;|&) Tools<\/h3>\s*<p>[^<]*<\/p>\s*<ul>[\s\S]*?<\/ul>/gi,
    ''
  );

  // Clean up multiple consecutive empty paragraphs or whitespace
  cleaned = cleaned.replace(/(<\/p>\s*){2,}/g, '</p>\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
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
    image: getAvatarUrl("Dr. Joao"),
    credentials: "PhD in Food Science, Expert in microbial pathogenesis and predictive modeling"
  },
  "Dr. Margarida": {
    name: "Dr. Margarida",
    slug: "dr-margarida",
    role: "Head of Compliance",
    bio: "Overseeing EU & UK regulatory alignment and audit standards.",
    image: getAvatarUrl("Dr. Margarida"),
    credentials: "PhD in Food Safety, Specialist in BRCGS/SQF certification requirements"
  },
  "Dr. Fabio": {
    name: "Dr. Fabio",
    slug: "dr-fabio",
    role: "Lead Auditor",
    bio: "Ensuring practical applicability and audit readiness on the factory floor.",
    image: getAvatarUrl("Dr. Fabio"),
    credentials: "Certified Lead Auditor, Expert in translating regulations into operational practice"
  },
  "Dr. Claudia": {
    name: "Dr. Claudia",
    slug: "dr-claudia",
    role: "Technical Lead",
    bio: "Driving the technological innovation behind our hazard analysis engine.",
    image: getAvatarUrl("Dr. Claudia"),
    credentials: "PhD in Food Technology, Specialist in food science and machine learning"
  },
  "Dr. Isabel": {
    name: "Dr. Isabel",
    slug: "dr-isabel",
    role: "Head of Ops",
    bio: "Managing operational excellence and customer success frameworks.",
    image: getAvatarUrl("Dr. Isabel"),
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

  const normalizedContent = normalizeContent(article.content);
  const headings = getHeadings(normalizedContent);
  const processedContent = transformBlockquotes(highlightListTerms(injectHeaderIds(fixWhatYoullLearn(removeBoilerplate(normalizedContent)))));
  const expert = getExpertFromContent(normalizedContent);
  const relatedArticles = getRelatedArticles(slug, article.category, 3);
  const faqs = generateFAQs(article.title, normalizedContent);

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
      },
      // FAQPage Schema for featured snippets
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <>
      <JSONLD data={structuredData} />
      <ArticleLayout
        article={{
          title: article.title,
          category: article.category,
          excerpt: article.excerpt,
          image: article.image,
          readTime: article.readTime,
        }}
        content={processedContent}
        headings={headings}
        expert={expert}
        relatedArticles={relatedArticles}
        faqs={faqs}
        publishedDate={publishedDate}
        dateModified={dateModified}
        showBreadcrumb
        breadcrumbCategory={article.category}
      />
    </>
  );
}
