require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

async function syncArticles() {
    console.log("📥 Fetching all articles from Supabase...");
    const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });

    if (error) {
        console.error("Error fetching articles:", error);
        return;
    }

    console.log(`Found ${articles.length} articles.`);

    const tsArticles = articles.map(a => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
        readTime: a.read_time,
        excerpt: a.excerpt,
        image: a.image || '',
        content: a.content,
        publishedAt: a.published_at || new Date().toLocaleDateString()
    }));

    const fileContent = `export interface Article {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image?: string;
  content: string;
  publishedAt: string;
}

export const articles: Article[] = ${JSON.stringify(tsArticles, null, 2)};
`;

    fs.writeFileSync(ARTICLES_PATH, fileContent);
    console.log(`✅ Synced ${articles.length} articles to src/data/articles.ts`);
}

syncArticles();