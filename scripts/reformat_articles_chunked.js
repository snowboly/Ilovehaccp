const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

async function reformatContent(content) {
    const prompt = `
    You are a professional encyclopedic editor (Wikipedia style). 
    
    OBJECTIVE: 
    Improve readability by breaking down "walls of text" into shorter, distinct paragraphs, without losing the academic/encyclopedic tone.

    STRICT RULES:
    1. **Short Paragraphs:** Max 3-4 sentences per paragraph. Add whitespace (new <p> tags) often.
    2. **Preserve Structure:** You MUST keep all <h3>, <h4>, <ul>, <li>, <blockquote>, and <figure> tags exactly as they are. Do not remove them.
    3. **No Markdown:** Return raw HTML string only. Do not wrap in ` + "```html" + ` code blocks.
    4. **Tone:** Keep the language professional, objective, and informative.
    5. **Integrity:** Do not summarize or delete information. Just restructure the whitespace and paragraph breaks.

    Input HTML:
    ${content}
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o-mini',
            temperature: 0.2,
        });
        let result = completion.choices[0].message.content;
        
        // Cleanup if the model adds markdown formatting despite instructions
        result = result.replace(/^```html\s*/, '').replace(/```$/, '');
        result = result.replace(/^```\s*/, '').replace(/```$/, '');
        
        return result;
    } catch (e) {
        console.error("Error reformatting:", e.message);
        return content; // Return original on error to be safe
    }
}

async function main() {
    console.log("Reading articles...");
    let fileContent = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // Regex to find all content fields using backticks
    // We also want to capture the slug or category to filter.
    // The structure is generally:
    // {
    //   "slug": "...",
    //   ...
    //   "content": `...`
    // }
    
    // Let's use a regex that captures the whole object block approximately
    // Or just find content and look back.
    
    const contentRegex = /"content": `([\s\S]*?)`,/g;
    
    let match;
    const items = [];
    
    // Niche keywords to identify the target articles
    const nicheKeywords = [
        "Burger Vans", "Pizza Takeaways", "School Canteens", 
        "Butcher Shops", "Fishmongers", "Gelato", "Ice Cream", 
        "Food Trucks", "Dark Kitchens", "Ghost Kitchens", "Sushi Bars",
        "Artisanal Bakeries"
    ];

    while ((match = contentRegex.exec(fileContent)) !== null) {
        const fullMatch = match[0];
        const originalContent = match[1];
        const startIndex = match.index;
        
        // Look back for title/slug to identify if it's a niche article
        const lookback = fileContent.substring(Math.max(0, startIndex - 1000), startIndex);
        
        // Check if any niche keyword is in the lookback (title/slug)
        const isNiche = nicheKeywords.some(kw => lookback.includes(kw));
        
        if (isNiche) {
             items.push({
                start: startIndex,
                end: startIndex + fullMatch.length,
                original: originalContent,
                fullMatch: fullMatch
            });
        }
    }
    
    console.log(`Found ${items.length} niche articles.`);

    const CHUNK_SIZE = 1;
    
    // Filter out already processed items
    const unformattedItems = items.filter(item => !item.original.includes("<!-- RF -->"));
    
    if (unformattedItems.length === 0) {
        console.log("All niche articles appear to be reformatted (marker found). Removing markers...");
        fileContent = fileContent.replace(/<!-- RF -->/g, "");
        fs.writeFileSync(ARTICLES_PATH, fileContent);
        console.log("Cleaned up markers. Done.");
        return;
    }

    console.log(`${unformattedItems.length} niche articles remaining to reformat.`);
    
    // Sort descending by start index to avoid shifting issues when replacing
    const batch = unformattedItems.sort((a, b) => b.start - a.start).slice(0, CHUNK_SIZE);
    
    console.log(`Processing batch of ${batch.length} articles (from end of file)...`);
    
    let currentFileContent = fileContent;

    for (const item of batch) {
        console.log(`Reformatting item at index ${item.start}...`);
        let newContent = await reformatContent(item.original);
        
        // Add marker
        newContent = "<!-- RF -->" + newContent;
        
        const safeContent = newContent.replace(/`/g, '\`').replace(/\${/g, '\\${');
        const newString = `"content": \`${safeContent}\,`;
        
        const pre = currentFileContent.substring(0, item.start);
        const post = currentFileContent.substring(item.end);
        currentFileContent = pre + newString + post;
    }
    
    fs.writeFileSync(ARTICLES_PATH, currentFileContent);
    console.log(`Batch complete. ${unformattedItems.length - batch.length} remaining.`);
}

main();