
const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

try {
    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // Replace all occurrences of the inappropriate Pexels ID 5779787
    // with a safe professional office/meeting one: 3183197
    const badId = '5779787';
    const safeId = '3183197';
    
    const count = (content.match(new RegExp(badId, 'g')) || []).length;
    console.log(`Found ${count} occurrences of inappropriate ID ${badId}.`);
    
    if (count > 0) {
        content = content.replace(new RegExp(badId, 'g'), safeId);
        fs.writeFileSync(ARTICLES_PATH, content);
        console.log(`✅ Successfully replaced all occurrences with ${safeId}.`);
    } else {
        console.log("No occurrences found.");
    }
} catch (e) {
    console.error(e);
}
