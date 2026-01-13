
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Config
const BASE_URL = 'https://www.ilovehaccp.com';
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');
const ROBOTS_PATH = path.join(__dirname, '../public/robots.txt');

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Static Routes
const STATIC_ROUTES = [
    '',
    '/about',
    '/builder',
    '/contact',
    '/features',
    '/pricing',
    '/resources',
    '/login',
    '/signup',
    '/privacy',
    '/terms',
    '/cookies',
    '/refund-policy',
    '/faqs',
    '/requirements-eu-uk'
];

async function generate() {
    console.log("🗺️  Generating Sitemap & Robots.txt...");

    let urls = [];

    // 1. Add Static Routes
    STATIC_ROUTES.forEach(route => {
        urls.push({
            loc: `${BASE_URL}${route}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: route === '' ? '1.0' : '0.8'
        });
    });

    // 2. Add Dynamic Articles (from DB)
    const { data: articles, error } = await supabase
        .from('articles')
        .select('slug, published_at');

    if (error) {
        console.error("❌ Error fetching articles:", error);
    } else if (articles) {
        console.log(`Found ${articles.length} articles.`);
        articles.forEach(article => {
            urls.push({
                loc: `${BASE_URL}/resources/${article.slug}`,
                lastmod: new Date().toISOString().split('T')[0], // Could parse published_at if valid date
                changefreq: 'weekly',
                priority: '0.7'
            });
        });
    }

    // 3. Build XML
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(SITEMAP_PATH, sitemapContent);
    console.log(`✅ sitemap.xml generated with ${urls.length} URLs.`);

    // 4. Build Robots.txt
    const robotsContent = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
    fs.writeFileSync(ROBOTS_PATH, robotsContent);
    console.log(`✅ robots.txt generated.`);
}

generate();
