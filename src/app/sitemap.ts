import { MetadataRoute } from 'next';
import { articles } from '@/data/articles';
import { SUPPORTED_LOCALES, type Language } from '@/lib/locales';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.ilovehaccp.com';
  const now = new Date();

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/resources/${article.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/sample-haccp-plan-pdf`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/haccp-template`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const localizedPathsByLocale = new Map<Language, string[]>([
    ['en', ['', '/haccp-plan-word-docx', '/haccp-plan-example-pdf', '/haccp-for-restaurants', '/haccp-template', '/eu-uk-requirements', '/faqs']],
    ['de', ['', '/haccp-plan-word-docx', '/haccp-plan-example-pdf', '/haccp-for-restaurants', '/haccp-template', '/eu-uk-requirements', '/faqs']],
    ['it', ['', '/haccp-plan-word-docx', '/haccp-plan-example-pdf', '/haccp-for-restaurants', '/haccp-template', '/eu-uk-requirements', '/faqs']],
    ['lt', ['', '/haccp-plan-word-docx', '/haccp-plan-example-pdf', '/haccp-for-restaurants', '/haccp-template', '/eu-uk-requirements', '/faqs']],
    ['pt', ['', '/haccp-plan-example-pdf', '/haccp-template', '/eu-uk-requirements', '/faqs']],
    ['es', ['', '/haccp-plan-example-pdf', '/haccp-template', '/eu-uk-requirements', '/faqs']],
    ['fr', ['', '/haccp-plan-example-pdf', '/haccp-template', '/eu-uk-requirements', '/faqs']],
  ]);

  const priorityByPath = (path: string) => {
    if (path === '') return 0.95;
    if (path === '/faqs') return 0.7;
    if (path === '/haccp-template' || path === '/eu-uk-requirements') return 0.75;
    return 0.8;
  };

  const localizedMarketing: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) => {
    const localePaths = localizedPathsByLocale.get(locale) ?? [];

    return localePaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: priorityByPath(path),
    }));
  });

  const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of [...routes, ...localizedMarketing, ...articleEntries]) {
    deduped.set(entry.url, entry);
  }

  return Array.from(deduped.values());
}
