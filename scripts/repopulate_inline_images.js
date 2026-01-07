require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use provided service key or fallback to env
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const KEYWORDS = [
    "food safety inspection", "commercial kitchen clean", "chef cooking", "food manufacturing plant", 
    "laboratory food testing", "haccp documentation", "food quality control", "restaurant kitchen", 
    "butcher meat preparation", "fresh ingredients"
];

// Cache to prevent duplicates (load existing used ones if possible, but for now just start fresh for this run)
const USED_IMAGES = new Set();

async function searchPexels(query) {
    return new Promise((resolve) => {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`;
        const options = { headers: { Authorization: PEXELS_API_KEY } };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.photos && json.photos.length > 0) {
                        for (const photo of json.photos) {
                            const imgUrl = photo.src.large2x || photo.src.large;
                            if (!USED_IMAGES.has(imgUrl)) {
                                USED_IMAGES.add(imgUrl);
                                resolve(imgUrl);
                                return;
                            }
                        }
                        resolve(null);
                    } else {
                        resolve(null);
                    }
                } catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

async function main() {
    console.log("📸 STARTING INLINE IMAGE REPLACEMENT 📸");
    
    if (!PEXELS_API_KEY) {
        console.error("❌ PEXELS_API_KEY missing.");
        process.exit(1);
    }

    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // We need to parse block by block to update DB correctly
    const parts = content.split('slug: "');
    let newFileContent = parts[0]; 
    
    let keywordIndex = 0;

    for (let i = 1; i < parts.length; i++) {
        let block = 'slug: "' + parts[i];
        
        const slugMatch = block.match(/slug:\s*["'](.*?)["']/);
        const slug = slugMatch ? slugMatch[1] : null;
        
        if (!slug) {
            newFileContent += block;
            continue;
        }

        console.log(`Processing inline images for: ${slug}`);

        // Find all inline images
        // We use a replacer function that is async? No, string.replace doesn't support async.
        // We have to find matches, fetch new URLs, then replace.
        
        const imgMatches = [...block.matchAll(/<img[^>]+src=["'](.*?)["'][^>]*>/g)];
        
        if (imgMatches.length > 0) {
            let updatedBlock = block;
            
            for (const match of imgMatches) {
                const fullTag = match[0];
                const oldUrl = match[1];
                
                // Get a new unique image
                let newUrl = null;
                let attempts = 0;
                while (!newUrl && attempts < 5) {
                    const keyword = KEYWORDS[keywordIndex % KEYWORDS.length];
                    newUrl = await searchPexels(keyword);
                    keywordIndex++;
                    attempts++;
                    await new Promise(r => setTimeout(r, 100));
                }

                if (newUrl) {
                    // Replace ONLY this instance in the block
                    // We use split/join or replace with literal string to avoid regex char issues in URLs
                    updatedBlock = updatedBlock.replace(oldUrl, newUrl);
                    // console.log(`  -> Swapped inline image.`);
                }
            }
            
            block = updatedBlock;

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
    console.log("✅ All inline images updated and synced.");
}

main();
