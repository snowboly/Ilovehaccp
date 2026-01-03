const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

function fix() {
    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // Look for malformed excerpt lines
    // Pattern: excerpt: "..." something here ",
    // We want to keep only the FIRST quoted string.
    
    const malformedRegex = /excerpt:\s*"([\s\S]*?)"[\s\S]*?",/g;
    
    let count = 0;
    const fixedContent = content.replace(malformedRegex, (match, firstQuote) => {
        // If there's garbage between the first closing quote and the comma, fix it.
        // The match looks like: excerpt: "First" garbage ",
        if (match.includes('"') && match.lastIndexOf('"') > match.indexOf('"') + firstQuote.length + 1) {
            count++;
            return `excerpt: "${firstQuote.replace(/"/g, "'")}",`; // Also escape any inner double quotes
        }
        return match;
    });

    if (count > 0) {
        fs.writeFileSync(ARTICLES_PATH, fixedContent);
        console.log(`Fixed ${count} malformed articles.`);
    } else {
        console.log("No malformed articles found by the simple fixer.");
    }
}

fix();
