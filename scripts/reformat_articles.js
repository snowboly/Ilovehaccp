const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

const TARGET_SLUGS = [
    'haccp-for-artisanal-bakeries-eu',
    'haccp-for-burger-vans-eu',
    'haccp-for-butcher-shops-eu',
    'haccp-for-fishmongers-eu',
    'haccp-for-school-canteens-eu',
    'haccp-for-pizza-takeaways-eu',
    'haccp-for-gelato-and-ice-cream-parlors-eu',
    'haccp-for-food-trucks-eu',
    'haccp-for-dark-kitchens-and-ghost-kitchens-eu',
    'haccp-for-sushi-bars-eu'
];

async function reformatContent(content) {
    const prompt = `
    You are a professional editor. 
    Task: Reformat the following HTML content to make it more readable. 
    1. BREAK DOWN long paragraphs into short, punchy paragraphs (max 3-4 sentences).
    2. Ensure every paragraph is wrapped in <p> tags.
    3. Keep all <h3>, <ul>, <li>, <blockquote> tags intact.
    4. Do NOT change the meaning or words significantly, just the structure/whitespace.
    5. Return ONLY the HTML string.

    Content to reformat:
    ${content}
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3
        });
        return completion.choices[0].message.content;
    } catch (e) {
        console.error("Error reformatting:", e.message);
        return content; // Return original on error
    }
}

async function main() {
    let fileContent = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    for (const slug of TARGET_SLUGS) {
        console.log(`Processing ${slug}...`);
        
        // Regex to find the article object by slug
        // Matches: "slug": "target-slug", ... "content": "..."
        // We need to capture the content string carefully.
        
        // Strategy: Find the start of the article object
        const slugIndex = fileContent.indexOf(`"slug": "${slug}"`);
        if (slugIndex === -1) {
            console.log(`  - Slug not found.`);
            continue;
        }

        // Find the "content" field after the slug
        const contentLabel = 'content": `'; // Assuming backticks were used or added by my generator
        // OR 'content": "' if double quotes. The snippet showed double quotes in the read_file output for some, backticks for others?
        // Let's check the format. The snippet showed: "content": "<h3>...
        // So it uses double quotes and escaped newlines \n.
        
        // Wait, if it uses double quotes, newlines must be literal \n characters in the file string?
        // Or actual newlines if using backticks.
        // The read_file output showed: "content": "<h3>Introduction...
        // This suggests double quotes.
        
        // Complex regex to capture content value in double quotes:
        // "content": "(.*?)"  <-- but this fails if content has escaped quotes.
        
        // Safer: Identify the range.
        // Since manually parsing json-like TS structure is hard with regex,
        // and I don't want to break the file, I will focus on the specific structure I know exists.
        
        // Let's try to find the start of content for this slug.
        const contentStartIndex = fileContent.indexOf('"content": "', slugIndex);
        if (contentStartIndex === -1) {
             // Try single quotes
             // Try backticks
             // Actually, the previous files used backticks in the generator script, but the read_file showed double quotes for the *new* ones?
             // No, read_file for `haccp-for-artisanal-bakeries-eu` showed `"content": "<h3>...`
             console.log("  - Content field not found (standard double quote).");
             continue;
        }

        const valueStart = contentStartIndex + 12; // Length of '"content": "'
        
        // Find the end of the content string. 
        // Since it's double quoted, it ends at the next unescaped double quote.
        // But the content itself might contain \" ... 
        
        let valueEnd = -1;
        for(let i = valueStart; i < fileContent.length; i++) {
            if (fileContent[i] === '"' && fileContent[i-1] !== '\\') {
                valueEnd = i;
                break;
            }
        }
        
        if (valueEnd === -1) {
            console.log("  - Could not find end of content string.");
            continue;
        }

        const oldContent = fileContent.substring(valueStart, valueEnd);
        
        // Unescape standard JSON escapes for processing
        const readableContent = oldContent
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\t/g, '\t');

        // Reformat
        const newContentReadable = await reformatContent(readableContent);

        // Escape back for JSON string
        const newContentEscaped = newContentReadable
            .replace(/\\/g, '\\\\') // Escape backslashes first
            .replace(/"/g, '\"')   // Escape quotes
            .replace(/\n/g, '\\n')  // Escape newlines
            .replace(/\r/g, '\\r');

        // Replace in file content
        // We must reconstruct the file string.
        // BEWARE: If I modify `fileContent` inside the loop, indices change.
        // So I should replace and update `fileContent` variable immediately.
        
        fileContent = fileContent.substring(0, valueStart) + newContentEscaped + fileContent.substring(valueEnd);
        console.log(`  - Updated.`);
    }

    fs.writeFileSync(ARTICLES_PATH, fileContent);
    console.log("Done reformatting.");
}

main();
