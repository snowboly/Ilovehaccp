const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/articles.ts');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix Headers: Replace <p>### Header</p> and <p>## Header</p> with <h3>Header</h3>
    // Using multiline flag and global flag
    // Pattern: <p>(#+)\s*(.*?)</p>
    const headerRegex = /<p># {2,3}\s*(.*?)<\/p>/g;
    content = content.replace(headerRegex, '<h3>$1</h3>');

    // NEW: Handle cases where ### Header is NOT inside a <p> tag
    // Pattern: ^###\s*(.*?) (at start of line or following newline)
    // We need to be careful not to match inside code blocks if there were any, but in this file it's unlikely.
    // We look for ### or ## followed by text, up to a newline or < sign
    const looseHeaderRegex = /(^|\n)#{2,3}\s*([^\n<]+)/g;
    content = content.replace(looseHeaderRegex, '$1<h3>$2</h3>');


    // 2. Add space after ### if it's not inside a tag (unlikely but let's be safe)
    // Actually, the user specifically mentioned "after ###". 
    // If there are any stray ### without space, fix them.
    content = content.replace(/(#{2,3})([^\s#])/g, '$1 $2');

    // 3. Add space after **
    // The user said "after **". 
    // Often it's like **Bold**:Text -> **Bold**: Text
    // Or **Bold** Text -> **Bold** Text (already has space)
    // Let's look for common patterns like **something**:followedByNonSpace
    content = content.replace(/\*\*:\s*([^\s<])/g, '**: $1');
    
    // Also, if they mean literally just space after the ending **, like **Bold**Text -> **Bold** Text
    content = content.replace(/\*\*([^\s<,.!?;:])/g, '** $1');
    
    // And for headers: If a header is followed immediately by a tag without newline, add a newline for readability in code
    content = content.replace(/(<\/h3>)([^\n\s<])/g, '$1\n$2');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated formatting in src/data/articles.ts');

} catch (err) {
    console.error('Error fixing file:', err);
}