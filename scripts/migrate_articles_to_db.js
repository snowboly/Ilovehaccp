require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  const tsPath = path.join(__dirname, '../src/data/articles.ts');
  const content = fs.readFileSync(tsPath, 'utf-8');

  // Split by article objects
  const blocks = content.split('  {').filter(b => b.trim().length > 10);
  console.log(`Found ${blocks.length} blocks.`);

  for (let block of blocks) {
    const slug = (block.match(/["']?slug["']?\s*:\s*["'](.*?)["']/) || [])[1];
    const title = (block.match(/["']?title["']?\s*:\s*["'](.*?)["']/) || [])[1];
    const category = (block.match(/["']?category["']?\s*:\s*["'](.*?)["']/) || [])[1];
    const readTime = (block.match(/["']?readTime["']?\s*:\s*["'](.*?)["']/) || [])[1];
    const excerpt = (block.match(/["']?excerpt["']?\s*:\s*["']([\s\S]*?)["']/) || [])[1];
    const image = (block.match(/["']?image["']?\s*:\s*["'](.*?)["']/) || [])[1];
    const publishedAt = (block.match(/["']?publishedAt["']?\s*:\s*["'](.*?)["']/) || [])[1];
    
    // Find content
    const contentMatch = block.match(/["']?content["']?\s*:\s*`([\s\S]*?)`/);
    let articleContent = contentMatch ? contentMatch[1] : null;

    if (!slug || !title || !articleContent) {
        if (slug) console.log(`Missing fields for ${slug}: title=${!!title}, content=${!!articleContent}`);
        continue;
    }

    articleContent = articleContent.replace(/\\`/g, '`').replace(/\\${/g, '${');

    const { error } = await supabase
      .from('articles')
      .update({
        title,
        category,
        read_time: readTime,
        excerpt,
        image,
        content: articleContent,
        published_at: publishedAt
      })
      .eq('slug', slug);

    if (error) {
      console.error(`Error uploading ${slug}:`, error.message);
    } else {
      console.log(`Uploaded: ${title} (${slug})`);
    }
  }

  console.log("Migration complete.");
}

migrate();
