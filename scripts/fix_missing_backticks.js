const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/articles.ts');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // The error is that the closing backtick is missing before the comma
    // Broken: ...</p>,
    // Fixed:  ...</p>`,
    
    // We target the </p>, followed by newline and whitespace and "publishedAt"
    const regex = /(<\/p>),\s*\r?\n\s*("publishedAt":)/g;
    
    // Check match count
    const matches = content.match(regex);
    console.log(`Found ${matches ? matches.length : 0} occurrences to fix.`);

    if (matches && matches.length > 0) {
        // Replace with: </p>`,
        // Group 1: </p>
        // Group 2: comma, newline + whitespace
        // Group 3: "publishedAt":
        const smartRegex = /(<\/p>)(,\s*\r?\n\s*)("publishedAt":)/g;
        
        const fixedContent = content.replace(smartRegex, '$1`$2$3');

        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log('Successfully fixed missing backticks in src/data/articles.ts');
    } else {
        console.log('No matches found. Checking for alternative patterns...');
        // debug check
        const idx = content.indexOf('</p>,');
        if (idx !== -1) {
            console.log(`Found '</p>,' at index ${idx}. Context:`);
            console.log(content.substring(idx, idx + 50));
        }
    }

} catch (err) {
    console.error('Error fixing file:', err);
}