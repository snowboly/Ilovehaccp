const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("🔄 STARTING DB SYNC 🔄");

    try {
        let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
        
        // Split by "slug:" to identify blocks roughly, then reconstruct
        // The first element will be the prelude (imports etc)
        const parts = content.split('slug: "');
        console.log(`Found ${parts.length - 1} potential articles.`);
        
        for (let i = 1; i < parts.length; i++) {
            // Reconstruct the block enough to find the other fields
            const block = 'slug: "' + parts[i];
            
            const slugMatch = block.match(/slug:\s*["'](.*?)["']/);
            const imageMatch = block.match(/image:\s*["'](.*?)["']/);
            
            // Extract content between backticks
            const contentStart = block.indexOf('content: `') + 10;
            const contentEnd = block.lastIndexOf('`');
            
            if (slugMatch && imageMatch && contentStart > 10 && contentEnd > contentStart) {
                const slug = slugMatch[1];
                const image = imageMatch[1];
                let articleContent = block.substring(contentStart, contentEnd);
                
                // Fix escaped backticks from file read (if any)
                articleContent = articleContent.replace(/\\`/g, '`').replace(/\\${/g, '${');

                const { error } = await supabase
                    .from('articles')
                    .update({
                        image: image, 
                        content: articleContent 
                    })
                    .eq('slug', slug);
                
                if (error) {
                    console.error(`❌ Failed to update ${slug}:`, error.message);
                } else {
                    // console.log(`   Updated ${slug}`);
                }
            }
        }
        console.log("✅ Supabase sync complete.");

    } catch (e) {
        console.error("❌ Critical Error:", e);
    }
}

main();