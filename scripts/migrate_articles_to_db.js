
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key.");
  process.exit(1);
}

console.log(`Using Supabase Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON_PUBLIC'}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {

  console.log("Parsing articles.ts via regex blocks...");
  
  const tsPath = path.join(__dirname, '../src/data/articles.ts');
  const content = fs.readFileSync(tsPath, 'utf-8');

  // Split by article objects
  const blocks = content.split('  {').filter(b => b.includes('slug:'));
  console.log(`Found ${blocks.length} blocks.`);

  for (let block of blocks) {
    const slug = (block.match(/slug:\s*['"](.*?)['"]/) || [])[1];
    const title = (block.match(/title:\s*["'](.*?)["']/) || [])[1];
    const category = (block.match(/category:\s*['"](.*?)['"]/) || [])[1];
    const readTime = (block.match(/readTime:\s*['"](.*?)['"]/) || [])[1];
    const excerpt = (block.match(/excerpt:\s*["']([\s\S]*?)["']/) || [])[1];
    const image = (block.match(/image:\s*['"](.*?)['"]/) || [])[1];
    const publishedAt = (block.match(/publishedAt:\s*['"](.*?)['"]/) || [])[1];
    
    // Extract content (everything between content: ` and the last `)
    const contentStartMarker = 'content: `';
    const contentStartIndex = block.indexOf(contentStartMarker);
    
    if (contentStartIndex === -1) continue;
    
    const contentStart = contentStartIndex + contentStartMarker.length;
    const contentEnd = block.lastIndexOf('`');
    
    if (contentEnd <= contentStart) continue;

    let articleContent = block.substring(contentStart, contentEnd);
    
    // Unescape backticks and ${}
    articleContent = articleContent.replace(/\\`/g, '`').replace(/\\\${/g, '${');

    if (!slug || !title) continue;

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
      console.log(`Uploaded: ${title}`);
    }
  }

  console.log("Migration complete.");
}

migrate();