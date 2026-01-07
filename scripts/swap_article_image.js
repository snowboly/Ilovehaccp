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

const supabase = createClient(supabaseUrl, supabaseKey);

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

const slug = process.argv[2];
const newImageUrl = process.argv[3];

if (!slug || !newImageUrl) {
  console.log("Usage: node scripts/swap_article_image.js <slug> <new_image_url>");
  process.exit(1);
}

async function swap() {
  console.log(`🚀 Swapping image for article: ${slug}`);

  // 1. Update local file
  try {
    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // Find the slug first
    const slugIndex = content.indexOf(`slug: "${slug}"`);
    if (slugIndex === -1) {
        console.warn("⚠️ Article slug not found in articles.ts.");
    } else {
        // Find the start of the object {
        let startIndex = slugIndex;
        while (content[startIndex] !== '{' && startIndex > 0) startIndex--;
        
        // Find the end of the object } (balancing braces)
        let braceCount = 0;
        let endIndex = startIndex;
        let foundStart = false;
        for (let i = startIndex; i < content.length; i++) {
            if (content[i] === '{') { braceCount++; foundStart = true; }
            else if (content[i] === '}') braceCount--;
            
            if (foundStart && braceCount === 0) {
                endIndex = i + 1;
                break;
            }
        }

        const articleBlock = content.substring(startIndex, endIndex);
        // Replace the top-level image field
        const updatedBlock = articleBlock.replace(/image:\s*["'].*?["']/, `image: "${newImageUrl}"`);
        content = content.substring(0, startIndex) + updatedBlock + content.substring(endIndex);
        
        fs.writeFileSync(ARTICLES_PATH, content);
        console.log("✅ Local articles.ts updated.");
    }
  } catch (err) {
    console.error("❌ Error updating local file:", err);
  }

  // 2. Update Database
  try {
    const { error } = await supabase
      .from('articles')
      .update({ image: newImageUrl })
      .eq('slug', slug);

    if (error) throw error;
    console.log("✅ Supabase database updated.");
  } catch (err) {
    console.error("❌ Error updating database:", err.message);
  }
}

swap();
