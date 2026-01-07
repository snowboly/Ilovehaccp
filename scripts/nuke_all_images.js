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

async function nukeImages() {
    console.log("☢️  INITIATING IMAGE NUKE PROTOCOL ☢️");

    try {
        let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
        
        // 1. Remove main image fields
        // Matches: image: "...", (with trailing comma and newline)
        content = content.replace(/image:\s*["'].*?["'],\s*?\n/g, '');
        // Fallback for cases without trailing comma/newline if any
        content = content.replace(/image:\s*["'].*?["']\s*/g, '');

        // 2. Remove inline <figure> blocks (often used for images)
        content = content.replace(/<figure[\s\S]*?<\/figure>/g, '');

        // 3. Remove standalone <img> tags
        content = content.replace(/<img[^>]*>/g, '');

        // Save local file
        fs.writeFileSync(ARTICLES_PATH, content);
        console.log("✅ Local file cleaned (Text Only).");

        // 4. Sync to Supabase
        console.log("🔄 Syncing cleaned content to Supabase...");
        
        // Split by "slug:" to identify blocks
        const parts = content.split('slug: "');
        console.log(`Found ${parts.length - 1} articles to clean.`);

        for (let i = 1; i < parts.length; i++) {
            // Reconstruct the block enough to find the slug
            const block = 'slug: "' + parts[i];
            const slugMatch = block.match(/slug:\s*["'](.*?)["']/);
            
            if (slugMatch) {
                const slug = slugMatch[1];
                
                // Extract content
                const contentStart = block.indexOf('content: `') + 10;
                const contentEnd = block.lastIndexOf('`');
                
                if (contentStart > 10 && contentEnd > contentStart) {
                    let articleContent = block.substring(contentStart, contentEnd);
                    // Sanitize escaped chars
                    articleContent = articleContent.replace(/\\`/g, '`').replace(/\\${/g, '${');

                    const { error } = await supabase
                        .from('articles')
                        .update({
                            image: null, // Explicitly set to null
                            content: articleContent 
                        })
                        .eq('slug', slug);
                    
                    if (error) console.error(`❌ Failed to clean ${slug}:`, error.message);
                }
            }
        }
        console.log("✅ Database successfully wiped of images.");

    } catch (e) {
        console.error("❌ Critical Error:", e);
    }
}

nukeImages();
