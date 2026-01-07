require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("🧹 STARTING CAPTION REMOVAL 🧹");

    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // We parse block by block
    const parts = content.split('slug: "');
    let newFileContent = parts[0]; 

    for (let i = 1; i < parts.length; i++) {
        let block = 'slug: "' + parts[i];
        
        const slugMatch = block.match(/slug:\s*["'](.*?)["']/);
        const slug = slugMatch ? slugMatch[1] : null;
        
        if (!slug) {
            newFileContent += block;
            continue;
        }

        // Remove <figcaption>...</figcaption>
        // Use regex with [\s\S]*? for multiline content inside caption
        if (block.includes('<figcaption')) {
            console.log(`Cleaning captions for: ${slug}`);
            block = block.replace(/<figcaption[\s\S]*?<\/figcaption>/g, '');
            
            // Sync to DB
            const contentStart = block.indexOf('content: `') + 10;
            const contentEnd = block.lastIndexOf('`');
            let articleContent = block.substring(contentStart, contentEnd);
            articleContent = articleContent.replace(/\\`/g, '`').replace(/\\${/g, '${');

            await supabase
                .from('articles')
                .update({ content: articleContent })
                .eq('slug', slug);
        }

        newFileContent += block;
    }

    fs.writeFileSync(ARTICLES_PATH, newFileContent);
    console.log("✅ All captions removed and synced.");
}

main();
