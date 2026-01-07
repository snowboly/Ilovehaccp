require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

if (!PEXELS_API_KEY) {
    console.error("Error: PEXELS_API_KEY not found.");
    process.exit(1);
}

// Helper: Sleep
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Helper: Search Pexels
async function searchPexels(query) {
    return new Promise((resolve) => {
        const safeQuery = encodeURIComponent(query + " food safety");
        const url = `https://api.pexels.com/v1/search?query=${safeQuery}&per_page=1&orientation=landscape`;
        const options = { headers: { Authorization: PEXELS_API_KEY } };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        if (json.photos && json.photos.length > 0) {
                            resolve(json.photos[0].src.large2x || json.photos[0].src.large);
                        } else {
                            resolve(null);
                        }
                    } catch (e) { resolve(null); }
                } else {
                    console.error(`Pexels API Error: ${res.statusCode}`);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            console.error("Pexels Network Error:", e.message);
            resolve(null);
        });
    });
}

async function main() {
    console.log("Starting Article Image Regeneration...");
    
    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // 1. SPLIT ARTICLES
    // We need to operate on the file block by block to avoid regex complexity on the whole file
    // The file structure is `export const articles: Article[] = [ { ... }, { ... } ];`
    // We'll use a regex to identify the start of each object `  {` and process inside.
    
    // Regex to capture the content of each article object:
    // We split by "  {" occurring at the start of a line (after newline)
    const blocks = content.split(/[\r\n]+\s\s\{/);
    console.log(`Found ${blocks.length} blocks.`);
    
    let newFileContent = blocks[0]; // Start with prelude

    for (let i = 1; i < blocks.length; i++) {
        let block = blocks[i];
        
        // We need to restore the "  {" that was consumed by the split
        // Actually, the split consumes the delimiter. We need to re-add it.
        // But since we are appending to newFileContent, we can just add it there.
        
        // Check if this is a valid article block (heuristic)
        if (!block.includes('slug:')) {
            newFileContent += '\n  {' + block; 
            continue;
        }

        console.log(`Processing article ${i}/${blocks.length - 1}...`);

        // 2. EXTRACT TITLE
        const titleMatch = block.match(/title:\s*["'](.*?)["']/);
        const title = titleMatch ? titleMatch[1] : "Food Safety";
        
        // 3. CLEAN OLD IMAGES
        // Remove `image: "...",` field
        block = block.replace(/image:\s*["'].*?["'],\s*\n/g, '');
        // Remove inline <figure>...</figure> and <img>
        block = block.replace(/<figure[\s\S]*?<\/figure>/g, '');
        block = block.replace(/<img[^>]*>/g, '');

        // 4. FETCH NEW MAIN IMAGE
        console.log(`  - Fetching main image for: "${title}"`);
        const mainImage = await searchPexels(title);
        await sleep(1000); // Rate limit

        // Insert `image: "url",` after `slug: "...",` (or at start)
        if (mainImage) {
             block = block.replace(/(slug:\s*["'].*?["'],)/, `$1\n    image: "${mainImage}",`);
        }

        // 5. INJECT INLINE IMAGE (One per article to be safe/clean)
        // Find the first H2
        const h2Regex = /<h2>(.*?)<\/h2>/;
        const h2Match = block.match(h2Regex);

        if (h2Match) {
            const h2Text = h2Match[1];
            console.log(`  - Fetching inline image for section: "${h2Text}"`);
            const inlineImage = await searchPexels(h2Text);
            await sleep(1000);

            if (inlineImage) {
                const figureHtml = `
      <figure class="my-12">
        <img src="${inlineImage}" alt="${h2Text} - Food Safety" class="w-full rounded-2xl shadow-lg" />
        <figcaption class="mt-4 text-center text-slate-500 italic text-sm">Visual representation of ${h2Text}</figcaption>
      </figure>`;
                
                // Insert after the closing </h2>
                block = block.replace(h2Match[0], h2Match[0] + '\n' + figureHtml);
            }
        }
        
        // Reconstruct
        newFileContent += '  {\n' + block;
    }

    fs.writeFileSync(ARTICLES_PATH, newFileContent);
    console.log("✅ All articles regenerated with safe images.");
}

main();
