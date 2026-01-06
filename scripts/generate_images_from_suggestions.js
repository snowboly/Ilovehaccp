require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');

// --- CONFIGURATION ---
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');
let PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
    try {
        const envPath = path.join(__dirname, '../.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const match = envContent.match(/PEXELS_API_KEY=(.*)/);
            if (match) {
                PEXELS_API_KEY = match[1].trim();
                console.log("Loaded PEXELS_API_KEY from .env.local manually.");
            }
        }
    } catch (e) {
        console.warn("Could not read .env.local manually.");
    }
}

if (!PEXELS_API_KEY) {
    console.error("Error: PEXELS_API_KEY not found in environment variables or .env.local.");
    process.exit(1);
}

// --- HELPER FUNCTIONS ---

async function searchPexels(query) {
    return new Promise((resolve, reject) => {
        let searchQuery = query;
        const lowerQuery = query.toLowerCase();
        if (!lowerQuery.includes('food') && !lowerQuery.includes('kitchen') && !lowerQuery.includes('safety')) {
            searchQuery += ' food safety';
        }

        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`;
        const options = { headers: { Authorization: PEXELS_API_KEY } };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        if (json.photos && json.photos.length > 0) {
                            resolve(json.photos[0].src.large2x || json.photos[0].src.large);
                        } else {
                            console.log(`   [Pexels] No results for: "${searchQuery}"`);
                            resolve(null);
                        }
                    } catch (e) {
                        resolve(null);
                    }
                } else {
                    console.error(`   [Pexels] API Error: ${res.statusCode}`);
                    resolve(null);
                }
            });
        }).on('error', (err) => {
            resolve(null);
        });
    });
}

async function main() {
    console.log(`Reading articles from: ${ARTICLES_PATH}`);
    
    if (!fs.existsSync(ARTICLES_PATH)) {
        console.error("Error: Articles file not found.");
        process.exit(1);
    }

    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    const suggestionRegex = /\[IMAGE_SUGGESTION:\s*(.*?)\]/g;
    
    const matches = [];
    let match;
    while ((match = suggestionRegex.exec(content)) !== null) {
        matches.push({
            fullMatch: match[0],
            description: match[1].trim(),
            index: match.index,
            length: match[0].length
        });
    }

    if (matches.length === 0) {
        console.log("No [IMAGE_SUGGESTION] tags found.");
        return;
    }

    console.log(`Found ${matches.length} suggestions.`);

    let replacementCount = 0;

    for (let i = matches.length - 1; i >= 0; i--) {
        const item = matches[i];
        console.log(`Processing: "${item.description}"`);
        
        const imageUrl = await searchPexels(item.description);
        
        if (imageUrl) {
            // Escape double quotes in description for alt attribute
            const altText = item.description.split('"').join('&quot;');
            const replacementHtml = `
      <figure class="my-12">
        <img src="${imageUrl}" alt="${altText}" class="w-full rounded-2xl shadow-lg" />
        <figcaption class="mt-4 text-center text-slate-500 italic text-sm">${item.description}</figcaption>
      </figure>`;
            
            const before = content.substring(0, item.index);
            const after = content.substring(item.index + item.length);
            content = before + replacementHtml + after;
            
            replacementCount++;
            console.log(`   Replaced.`);
        } else {
            console.log("   Skipping (no image).");
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (replacementCount > 0) {
        console.log(`Writing changes...`);
        fs.writeFileSync(ARTICLES_PATH, content, 'utf-8');
        console.log(`Done. Replaced ${replacementCount} images.`);
    }
}

main();
