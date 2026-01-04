const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

function fix() {
    console.log("Fixing articles syntax...");
    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

    // 1. Fix the start
    content = content.replace('articles: Article[] = [\n    slug:', 'articles: Article[] = [\n  {\n    slug:');

    // 2. Fix the separators between articles
    // It currently might look like `},\n    slug:` but it should be `\n  },\n  {\n    slug:`
    // The previous script used `.join('  {\n    slug:')` which missing the opening brace after the first one and potentially messed up others.
    
    // Let's use a safer approach: split by `    slug:` and rejoin properly
    const parts = content.split(/\n\s+slug:/);
    const header = parts.shift();
    
    const fixedContent = header + parts.map(p => `\n  {\n    slug:${p}`).join('\n  },');
    
    // Ensure the last one is closed before the array ends
    // The last part will have `\n];` at the end
    
    fs.writeFileSync(ARTICLES_PATH, fixedContent);
    console.log("Syntax fixed.");
}

fix();

