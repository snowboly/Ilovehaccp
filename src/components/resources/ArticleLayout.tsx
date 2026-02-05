'use client';

import Link from 'next/link';
import ReadingProgress from '@/components/resources/ReadingProgress';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface RelatedArticle {
  slug: string;
  title: string;
  category: string;
  image?: string;
  readTime: string;
}

interface Expert {
  name: string;
  role: string;
  image: string;
  credentials: string;
  slug?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ArticleLayoutProps {
  article: {
    title: string;
    category: string;
    excerpt: string;
    readTime?: string;
    image?: string;
  };
  content: string; // HTML content
  headings: Heading[];
  expert: Expert;
  relatedArticles: RelatedArticle[];
  faqs: FAQ[];
  publishedDate?: string;
  dateModified?: string;
  showBreadcrumb?: boolean;
  breadcrumbCategory?: string;
}

export default function ArticleLayout({
  article,
  content,
  headings,
  expert,
  relatedArticles,
  faqs,
  publishedDate,
  dateModified,
  showBreadcrumb = true,
  breadcrumbCategory,
}: ArticleLayoutProps) {
  const h2Headings = headings.filter(h => h.level === 2);

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      {/* Breadcrumb Header */}
      {showBreadcrumb && (
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/resources" className="hover:text-blue-600 transition-colors">
              Resources
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-medium">
              {breadcrumbCategory || article.category}
            </span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16">
          <main className="lg:w-3/4 min-w-0">
            {/* Article Header */}
            <header className="mb-8 max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wide">
                  {article.category}
                </span>
                {article.readTime && (
                  <span className="text-slate-400 text-sm">{article.readTime}</span>
                )}
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
                {/* Hero image - Mobile */}
                {article.image && (
                  <figure className="mb-10 lg:hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full rounded-xl shadow-sm"
                    />
                  </figure>
                )}

                {/* Table of Contents - Mobile */}
                {h2Headings.length > 0 && (
                  <div className="lg:hidden mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="font-semibold text-slate-900 text-sm mb-3">
                      In this article
                    </div>
                    <nav className="text-sm space-y-2">
                      {h2Headings.map((h, i) => (
                        <a
                          key={i}
                          href={`#${h.id}`}
                          className="block text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Article Content */}
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
                  dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Author Card */}
                <div className="mt-16 p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-4">
                    <img
                      src={expert.image}
                      alt={expert.name}
                      className="w-16 h-16 rounded-full bg-white shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        Written by
                      </div>
                      <Link
                        href="/about"
                        className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {expert.name}
                      </Link>
                      <div className="text-sm text-slate-600 mt-1">{expert.role}</div>
                    </div>
                  </div>
                  {(publishedDate || dateModified) && (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-400">
                      {publishedDate && <span>Published: {publishedDate}</span>}
                      {dateModified && <span>Last reviewed: {dateModified}</span>}
                    </div>
                  )}
                </div>

                {/* FAQ Section */}
                {faqs.length > 0 && (
                  <div className="mt-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {faqs.map((faq, i) => (
                        <details
                          key={i}
                          className="group bg-slate-50 rounded-lg border border-slate-100"
                        >
                          <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                            <span className="font-medium text-slate-900 pr-4">
                              {faq.question}
                            </span>
                            <svg
                              className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </summary>
                          <div className="px-4 pb-4 text-slate-600 text-[15px] leading-relaxed">
                            {faq.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <div className="mt-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                      Related Articles
                    </h2>
                    <div className="grid gap-4">
                      {relatedArticles.map((related) => (
                        <Link
                          key={related.slug}
                          href={`/resources/${related.slug}`}
                          className="group flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                        >
                          {related.image && (
                            <img
                              src={related.image}
                              alt={related.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-500 mb-1">
                              {related.category} · {related.readTime}
                            </div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {related.title}
                            </h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Section */}
                <div className="mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Ready to build your HACCP plan?
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Create a compliant, audit-ready HACCP plan for your food business in
                    minutes.
                  </p>
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Building
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-[280px] shrink-0">
                <div className="sticky top-8 space-y-6">
                  {/* Hero image - Desktop */}
                  {article.image && (
                    <div className="rounded-xl overflow-hidden shadow-sm">
                      <img src={article.image} alt={article.title} className="w-full" />
                    </div>
                  )}

                  {/* Table of Contents - Desktop */}
                  {h2Headings.length > 0 && (
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl">
                      <div className="font-semibold text-slate-900 text-sm mb-4">
                        In this article
                      </div>
                      <nav className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {h2Headings.map((h, i) => (
                          <a
                            key={i}
                            href={`#${h.id}`}
                            className="block text-sm text-slate-600 hover:text-blue-600 transition-colors py-1 border-l-2 border-transparent hover:border-blue-600 pl-3 -ml-px"
                          >
                            {h.text}
                          </a>
                        ))}
                      </nav>
                    </div>
                  )}

                  {/* Related Articles Sidebar */}
                  {relatedArticles.length > 0 && (
                    <div className="text-sm">
                      <div className="font-semibold text-slate-900 mb-3">Related Articles</div>
                      <ul className="space-y-3">
                        {relatedArticles.slice(0, 3).map((related) => (
                          <li key={related.slug}>
                            <Link
                              href={`/resources/${related.slug}`}
                              className="text-slate-600 hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                            >
                              {related.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick Links */}
                  <div className="text-sm pt-4 border-t border-slate-100">
                    <ul className="space-y-2">
                      <li>
                        <Link
                          href="/resources"
                          className="text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          All Resources
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/builder"
                          className="text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          HACCP Builder
                        </Link>
                      </li>
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
