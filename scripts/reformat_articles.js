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
    3. **No Markdown:** Return raw HTML string only. Do not wrap in markdown code blocks.
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
    const contentRegex = /"content": `([\s\S]*?)`,/g;
    
    let match;
    const items = [];
    
    while ((match = contentRegex.exec(fileContent)) !== null) {
        const fullMatch = match[0];
        const originalContent = match[1];
        const startIndex = match.index;
        
        // Only process long content
        if (originalContent.length > 500) {
            items.push({
                start: startIndex,
                end: startIndex + fullMatch.length,
                original: originalContent
            });
        }
    }
    
    console.log(`Found ${items.length} articles to reformat. Processing from index 4...`);
    
    // Process sequentially starting from index 4 (since 1-4 were likely done or partially done)
    // Actually, to be safe and ensure the file is consistent, we should process all, 
    // but we can skip the ones that look already formatted if we had a check.
    // Since we are rewriting the WHOLE file at the end, we need to process ALL or keep the old ones.
    // The previous run cancelled, so the file WAS NOT written. We must start from 0.
    
    // To avoid timeout, let's process a smaller chunk and save.
    // We can't easily partial save with this logic.
    // Let's optimize: parallelize with a limit.
    
    const CONCURRENCY = 5;
    let newFileContent = "";
    let lastIndex = 0;
    
    for (let i = 0; i < items.length; i += CONCURRENCY) {
        const batch = items.slice(i, i + CONCURRENCY);
        console.log(`Processing batch ${i/CONCURRENCY + 1}/${Math.ceil(items.length/CONCURRENCY)}...`);
        
        const results = await Promise.all(batch.map(async (item) => {
            const newContent = await reformatContent(item.original);
            const safeContent = newContent.replace(/`/g, '\`').replace(/\${/g, '\\${');
            return {
                ...item,
                newString: `"content": 

${safeContent}

,`
            };
        }));
        
        // Append results in order
        for (const res of results) {
            newFileContent += fileContent.substring(lastIndex, res.start);
            newFileContent += res.newString;
            lastIndex = res.end;
        }
    }
    
    newFileContent += fileContent.substring(lastIndex);
    
    fs.writeFileSync(ARTICLES_PATH, newFileContent);
    console.log("Done! All articles reformatted.");
}

main();
