'use client';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ArticleTableOfContentsProps {
  headings: Heading[];
  layout: 'mobile' | 'desktop';
}

export function ArticleTableOfContents({
  headings,
  layout,
}: ArticleTableOfContentsProps) {
  const h2Headings = headings.filter((h) => h.level === 2);

  if (h2Headings.length === 0) return null;

  if (layout === 'mobile') {
    return (
      <div className="lg:hidden mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
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
    );
  }

  return (
    <div className="hidden lg:block bg-slate-50 border border-slate-100 p-4 rounded-xl">
      <div className="font-semibold text-slate-900 text-sm mb-3">
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
  );
}
