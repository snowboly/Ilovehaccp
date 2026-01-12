const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/articles.ts');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Convert ** Text ** to <strong>Text</strong>
    // We handle optional whitespace inside the **
    // Pattern: \*\*\s*(.*?)\s*\*\*
    // Replacement: <strong>$1</strong>
    
    // We should be careful about greedy matching. (.*?) is non-greedy.
    // Also handle newlines if they happen (though usually markdown bold is per line/block).
    
    const boldRegex = /\*\*\s*(.*?)\s*\*\*/g;
    
    // First pass count
    const matches = content.match(boldRegex);
    console.log(`Found ${matches ? matches.length : 0} bold markdown instances.`);

    if (matches) {
        content = content.replace(boldRegex, '<strong>$1</strong>');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully rendered markdown bold to HTML strong tags.');
    } else {
        console.log('No markdown bold tags found.');
    }

} catch (err) {
    console.error('Error fixing file:', err);
}
