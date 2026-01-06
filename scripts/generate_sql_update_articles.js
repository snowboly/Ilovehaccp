const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');
const OUTPUT_SQL_PATH = path.join(__dirname, '../update_articles_content.sql');

function escapeSql(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

function main() {
    console.log(`Reading articles from: ${ARTICLES_PATH}`);
    
    if (!fs.existsSync(ARTICLES_PATH)) {
        console.error("Error: Articles file not found.");
        process.exit(1);
    }

    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // Normalize content to help regex
    // content = content.replace(/\r\n/g, '\n');

    // Split by article start pattern to handle one by one
    // Each article starts with { slug: "..."
    const parts = content.split(/\{\s*slug:\s*/);
    
    // Remove the first part (header stuff)
    parts.shift();

    let sql = `-- Update articles content and images from local file\n`;
    let count = 0;

    for (const part of parts) {
        // Extract slug
        const slugMatch = part.match(/^["'](.*?)["']/);
        if (!slugMatch) continue;
        const slug = slugMatch[1];

        // Extract image
        const imageMatch = part.match(/image:\s*["'](.*?)["']/);
        let image = imageMatch ? imageMatch[1] : '';

        // Extract content
        // Content starts with content: ` and ends with `, (end of prop) or `\n  },` (end of obj)
        // We need to find the content backticks.
        const contentStart = part.indexOf('content: `');
        if (contentStart === -1) continue;
        
        const contentBodyStart = contentStart + 10; // length of 'content: `'
        
        // Find the CLOSING backtick. 
        // CAUTION: The content itself might contain backticks? Unlikely for this file format but possible.
        // Usually it ends with `,` or `\n` followed by `}`.
        // Let's assume the last backtick before the next object close `}` or `,` at the end of the string block is the one.
        
        // Strategy: find the last backtick in this part relative to the closing brace? 
        // No, 'part' goes until the next slug. 
        // Actually, splitting by `{ slug:` is risky if `slug:` appears in content.
        // But `slug:` property usually has indentation.
        
        // Let's use a regex for content extraction that looks for the backtick block
        // content: `...`
        
        // We look for the FIRST backtick after `content:`
        // And the LAST backtick before the end of the object?
        
        // Let's rely on the structure:
        // content: `
        // ...
        // `
        
        // Find first ` after content:
        const backtickStart = part.indexOf('`', contentStart);
        if (backtickStart === -1) continue;

        // Find the closing backtick. 
        // It should be followed by a comma or closing brace, potentially with whitespace.
        // We look for `\s*[,}]`
        
        // Let's scan from the end of the string backwards for a backtick
        // But 'part' contains everything until the next slug.
        // The next slug starts with `{ slug:`. We split by that.
        // So 'part' should end near the end of the current object.
        // It might contain the `},` separator.
        
        let backtickEnd = part.lastIndexOf('`');
        if (backtickEnd <= backtickStart) continue; // Should not happen if valid

        const articleContent = part.substring(backtickStart + 1, backtickEnd);

        if (slug && articleContent) {
            sql += `UPDATE articles SET content = '${escapeSql(articleContent)}', image = '${escapeSql(image)}' WHERE slug = '${slug}';\n`;
            count++;
        }
    }

    fs.writeFileSync(OUTPUT_SQL_PATH, sql);
    console.log(`Generated SQL for ${count} articles at ${OUTPUT_SQL_PATH}`);
}

main();