require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// We'll use dynamic import or just require if we compile it to JS temporarily
// But the easiest way is to use the existing data if we can load it.
// Since it's a huge TS file, let's try a different approach:
// We'll use a simplified parser that reads the file line by line.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function migrate() {
  console.log("Loading articles data...");
  
  // Directly requiring the TS file might fail in a standard node env.
  // We'll use a hack: read the file, remove the types, and save as a temp JS file.
  const fs = require('fs');
  const tsPath = path.join(__dirname, '../src/data/articles.ts');
  const jsPath = path.join(__dirname, 'temp_articles.cjs');
  
  let content = fs.readFileSync(tsPath, 'utf-8');
  // Strip potential markdown code blocks like ```html ... ``` that AI might have included
  content = content.replace(/```html/g, '').replace(/```/g, '');
  
  // Remove the interface and the type annotation
  content = content.replace(/export interface Article \{[\s\S]*?\}/, '');
  content = content.replace(/: Article\[\]/g, '');
  content = content.replace(/export const articles =/g, 'const articles =');
  content = content.replace(/export const articles: Article\[\] =/g, 'const articles =');
  content += '\nmodule.exports = { articles };';
  
  fs.writeFileSync(jsPath, content);
  
  const { articles } = require('./temp_articles.cjs');
  console.log(`Loaded ${articles.length} articles.`);

  for (const article of articles) {
    const { error } = await supabase
      .from('articles')
      .upsert({
        slug: article.slug,
        title: article.title,
        category: article.category,
        read_time: article.readTime,
        excerpt: article.excerpt,
        image: article.image,
        content: article.content,
        published_at: article.publishedAt
      }, { onConflict: 'slug' });

    if (error) {
      console.error(`Error uploading ${article.slug}:`, error.message);
    } else {
      console.log(`Uploaded: ${article.title}`);
    }
  }

  // Cleanup
  fs.unlinkSync(jsPath);
  console.log("Migration complete!");
}

migrate();