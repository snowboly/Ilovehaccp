require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const KEYWORDS = [
    "paperwork", "bureaucracy", "note pads", "food industry", 
    "restaurants", "butcher shop", "coffee shop", "food processing", 
    "haccp", "natural ingredients"
];

// Cache to prevent duplicates
const USED_IMAGES = new Set();

async function searchPexels(query) {
    return new Promise((resolve) => {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`;
        const options = { headers: { Authorization: PEXELS_API_KEY } };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.photos && json.photos.length > 0) {
                        // Find first unused image
                        for (const photo of json.photos) {
                            const imgUrl = photo.src.large2x || photo.src.large;
                            if (!USED_IMAGES.has(imgUrl)) {
                                USED_IMAGES.add(imgUrl);
                                resolve(imgUrl);
                                return;
                            }
                        }
                        // If all used, return null (will try next keyword)
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
    console.log("📸 STARTING IMAGE REPOPULATION 📸");
    
    if (!PEXELS_API_KEY) {
        console.error("❌ PEXELS_API_KEY missing.");
        process.exit(1);
    }

    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    const parts = content.split('slug: "');
    let newContent = parts[0]; // Header
    
    let keywordIndex = 0;

    for (let i = 1; i < parts.length; i++) {
        // Reconstruct block
        let block = 'slug: "' + parts[i];
        
        // Extract title for context (optional, but good for logging)
        const titleMatch = block.match(/title:\s*["'](.*?)["']/);
        const title = titleMatch ? titleMatch[1] : `Article ${i}`;
        
        console.log(`Processing ${i}/${parts.length - 1}: "${title.substring(0, 30)}"...`);

        // 1. Select Keyword (Cycle through list)
        let image = null;
        let attempts = 0;
        
        while (!image && attempts < KEYWORDS.length) {
            const keyword = KEYWORDS[keywordIndex % KEYWORDS.length];
            // console.log(`  - Searching: ${keyword}`);
            image = await searchPexels(keyword);
            keywordIndex++;
            attempts++;
            await new Promise(r => setTimeout(r, 200)); // Rate limit
        }

        if (!image) {
            console.warn("  ⚠️ Could not find unique image. Using fallback.");
            image = "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=1200";
        }

        // 2. Inject Image Field
        // We know it's currently missing because we nuked it.
        // Insert it after the slug line.
        block = block.replace(/(slug: ".*?",)/, `$1\n    image: "${image}",`);

        // 3. Inject Inline Image (Optional - let's skip to keep it clean/safe for now, or add one)
        // You asked to swap images "inside of the text" too.
        // Let's find the first H2 and inject a <figure> after it.
        
        // Find a second unique image for inline
        let inlineImage = null;
        // Search again with next keyword
        const inlineKeyword = KEYWORDS[keywordIndex % KEYWORDS.length];
        inlineImage = await searchPexels(inlineKeyword);
        keywordIndex++;

        if (inlineImage) {
             const h2Regex = /(<h2>.*?<\/h2>)/;
             const figureHtml = `
      <figure class="my-12">
        <img src="${inlineImage}" alt="Food safety illustration" class="w-full rounded-2xl shadow-lg" />
        <figcaption class="mt-4 text-center text-slate-500 italic text-sm">Visual representation of ${inlineKeyword}</figcaption>
      </figure>`;
             block = block.replace(h2Regex, `$1\n${figureHtml}`);
        }

        newContent += block;

        // 4. Database Sync (Immediate)
        // Extract updated content
        const slugMatch = block.match(/slug:\s*["'](.*?)["']/);
        if (slugMatch) {
            const slug = slugMatch[1];
            const contentStart = block.indexOf('content: `') + 10;
            const contentEnd = block.lastIndexOf('`');
            let articleContent = block.substring(contentStart, contentEnd);
            articleContent = articleContent.replace(/\`/g, '`').replace(/\$\{/g, '${');

            await supabase
                .from('articles')
                .update({ image: image, content: articleContent })
                .eq('slug', slug);
        }
    }

    fs.writeFileSync(ARTICLES_PATH, newContent);
    console.log("✅ All articles repopulated and synced.");
}

main();
