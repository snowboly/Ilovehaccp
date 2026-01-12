const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

function fixStructure() {
    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

    // Fix <p><h3>...</h3></p> pattern
    // Also handling potential whitespace
    content = content.replace(/<p>\s*<h([1-6])>/g, '<h$1>');
    content = content.replace(/<\/h([1-6])>\s*<\/p>/g, '</h$1>');

    // Also fix self-closing or weird <p> tags around block elements if any
    // For now, the specific issue seen was <p><h3>
    
    // Also remove empty <p></p> which might have been created
    content = content.replace(/<p>\s*<\/p>/g, '');

    fs.writeFileSync(ARTICLES_PATH, content);
    console.log("Fixed HTML structure in articles.ts");
}

fixStructure();