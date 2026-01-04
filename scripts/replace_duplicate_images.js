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
            console.log("Loaded PEXELS_API_KEY manually from .env.local");
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
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
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
    const articleRegex = /\{\s*slug:\s*['"](.*?)['"][\s\S]*?title:\s*["'](.*?)["'][\s\S]*?image:\s*['"](.*?)['"]/g;
    
    let match;
    const articles = [];
    while ((match = articleRegex.exec(content)) !== null) {
        articles.push({
            slug: match[1],
            title: match[2],
            image: match[3]
        });
    }
    
    console.log(`Found ${articles.length} articles.`);
    
    const imageCounts = {};
    articles.forEach(a => { imageCounts[a.image] = (imageCounts[a.image] || 0) + 1; });
    
    const updates = [];
    for (const article of articles) {
        if (imageCounts[article.image] > 1) {
            let query = article.title
                .replace(/HACCP/g, '')
                .replace(/Food Safety/g, '')
                .replace(/Plan/g, '')
                .replace(/Guide/g, '')
                .replace(/vs/g, '')
                .replace(/The/g, '')
                .replace(/How to/g, '')
                .replace(/:/g, '')
                .trim();
            const words = query.split(/\s+/);
            if (words.length > 3) query = words.slice(0, 3).join(' ');
            if (!query.toLowerCase().includes('food')) query += ' food';
            
            console.log(`Duplicate image for "${article.title}". Searching Pexels for: "${query}"...`);
            const newImage = await searchPexels(query);
            
            if (newImage) {
                console.log(`  -> Found: ${newImage}`);
                updates.push({
                    originalImage: article.image,
                    newImage: newImage,
                    slug: article.slug
                });
            } else {
                console.log("  -> No image found.");
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    
    let newContent = content;
    
    for (const update of updates) {
        const slugSingle = `slug: '${update.slug}'`;
        const slugDouble = `slug: "${update.slug}"`;
        
        let startIndex = newContent.indexOf(slugSingle);
        if (startIndex === -1) {
            startIndex = newContent.indexOf(slugDouble);
        }
        
        if (startIndex !== -1) {
            const remainder = newContent.slice(startIndex);
            const imageKeyIndex = remainder.indexOf('image:');
            
            if (imageKeyIndex !== -1 && imageKeyIndex < 5000) {
                const contentBetween = remainder.slice(0, imageKeyIndex);
                // Check if we ran into another slug
                if (contentBetween.slice(10).includes('slug:')) { // 10 buffer for current slug
                     console.error(`Skipping ${update.slug}: 'image:' found seems to belong to next article.`);
                     continue;
                }

                const valuePartStart = imageKeyIndex + 6;
                const valuePart = remainder.slice(valuePartStart).trimStart();
                const distanceToValue = remainder.slice(valuePartStart).indexOf(valuePart);
                const quote = valuePart[0];
                
                if (quote === "'" || quote === '"') {
                    const closingQuoteIndex = valuePart.indexOf(quote, 1);
                    if (closingQuoteIndex !== -1) {
                        const currentUrl = valuePart.slice(1, closingQuoteIndex);
                        
                        // Loose match check or assume correct if we are in the right block
                        if (currentUrl === update.originalImage) {
                            const absoluteUrlStart = startIndex + valuePartStart + distanceToValue + 1;
                            const absoluteUrlEnd = absoluteUrlStart + currentUrl.length;
                            
                            newContent = newContent.slice(0, absoluteUrlStart) + update.newImage + newContent.slice(absoluteUrlEnd);
                            console.log(`Applied update for ${update.slug}`);
                        } else {
                            console.error(`Mismatch for ${update.slug}: Found URL "${currentUrl}"`);
                        }
                    } else {
                        console.error(`Could not find closing quote for image in ${update.slug}`);
                    }
                } else {
                    console.error(`Image value does not start with quote in ${update.slug}`);
                }
            } else {
                console.error(`Could not find 'image:' key for ${update.slug}`);
            }
        } else {
            console.error(`Could not find slug block for ${update.slug}`);
        }
    }
    
    if (updates.length > 0) {
        fs.writeFileSync(articlesPath, newContent, 'utf-8');
        console.log(`Updated ${updates.length} articles with new images.`);
    } else {
        console.log("No duplicate images found or no updates needed.");
    }
}

main();