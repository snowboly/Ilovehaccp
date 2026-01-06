require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const https = require('https');

let PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
    try {
        const envPath = path.join(__dirname, '../.env.local');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/PEXELS_API_KEY=(.*)/);
        if (match) {
            PEXELS_API_KEY = match[1].trim();
        }
    } catch (e) {}
}

if (!PEXELS_API_KEY) {
    console.error("Error: PEXELS_API_KEY not found in .env.local");
    process.exit(1);
}

const articlesPath = path.join(__dirname, '../src/data/articles.ts');

async function searchPexels(query) {
    return new Promise((resolve, reject) => {
        // Enhance query for better results if needed
        let searchQuery = query;
        if (!searchQuery.toLowerCase().includes('food') && !searchQuery.toLowerCase().includes('kitchen') && !searchQuery.toLowerCase().includes('safety')) {
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
                            resolve(null);
                        }
                    } catch (e) { resolve(null); }
                } else { resolve(null); }
            });
        }).on('error', (err) => { resolve(null); });
    });
}

async function main() {
    let content = fs.readFileSync(articlesPath, 'utf-8');
    
    // Regex to find [IMAGE_SUGGESTION: description]
    const suggestionRegex = /\[IMAGE_SUGGESTION:\s*(.*?)\]/g;
    let match;
    const suggestions = [];

    while ((match = suggestionRegex.exec(content)) !== null) {
        suggestions.push({
            fullMatch: match[0],
            description: match[1],
            index: match.index
        });
    }

    console.log(`Found ${suggestions.length} image suggestions.`);

    // Work backwards to avoid index shift issues
    for (let i = suggestions.length - 1; i >= 0; i--) {
        const suggestion = suggestions[i];
        console.log(`Processing suggestion: "${suggestion.description}"...`);
        
        const imageUrl = await searchPexels(suggestion.description);
        
        if (imageUrl) {
            const replacement = `
      <figure class="my-12">
        <img src="${imageUrl}" alt="${suggestion.description}" class="w-full rounded-2xl shadow-lg" />
        <figcaption class="mt-4 text-center text-slate-500 italic text-sm">${suggestion.description}</figcaption>
      </figure>`;
            
            content = content.slice(0, suggestion.index) + replacement + content.slice(suggestion.index + suggestion.fullMatch.length);
            console.log(`  -> Replaced with Pexels image.`);
        } else {
            console.log(`  -> Failed to find image on Pexels. Keeping suggestion.`);
        }
        
        // Rate limiting delay
        await new Promise(r => setTimeout(r, 500));
    }

    fs.writeFileSync(articlesPath, content, 'utf-8');
    console.log(`Finished processing all suggestions.`);
}

main();
