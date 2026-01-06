const Groq = require('groq-sdk');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Clients
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const OPENAI_MODEL = 'gpt-4o-mini'; // Extremely cheap fallback
const WORD_COUNT_TARGET = 4500;

// --- PERSONAS ---
const PERSONAS = [
  {
    id: 'academic_joao',
    role: 'Dr. Joao, Scientific Lead & Founder',
    tone: 'Academic, rigorous, evidence-based, precise.',
    style: 'Uses technical terminology, cites principles extensively, focuses on the "why" at a molecular/biological level.',
    instruction: 'Write as a professor educating advanced practitioners. Focus on the scientific validity of HACCP principles.'
  },
  {
    id: 'auditor_margarida',
    role: 'Dr. Margarida, Head of Compliance',
    tone: 'Professional, compliance-focused, detail-oriented, strict.',
    style: 'Focuses on audit readiness, documentation, regulatory citations (CFR, EC 852/2004), and red flags.',
    instruction: 'Write as if preparing a client for a surprise inspection. Focus on "passing the audit" and regulatory alignment.'
  }
];

const FDA_CONTEXT = `
CORE HACCP PRINCIPLES (FDA/CODEX):
1. Conduct a hazard analysis. (Biological, Chemical, Physical).
2. Determine Critical Control Points (CCPs).
3. Establish Critical Limits.
4. Establish Monitoring Procedures.
5. Establish Corrective Actions.
6. Establish Verification Procedures.
7. Establish Record-Keeping and Documentation Procedures.
`;

// --- HELPER WITH RETRY & FALLBACK ---
async function safeAiCall(messages, temperature, jsonMode = false) {
    // 1. Try Groq
    try {
        const params = {
            messages,
            model: GROQ_MODEL,
            temperature,
        };
        if (jsonMode) {
            params.response_format = { type: 'json_object' };
        }

        const completion = await groq.chat.completions.create(params);
        return completion.choices[0].message.content;

    } catch (groqError) {
        // Check for Rate Limit (429)
        if (groqError.status === 429) {
            console.warn("⚠️ Groq Rate Limit (429) hit. Switching to OpenAI fallback...");
            
            // 2. Fallback to OpenAI
            try {
                const params = {
                    messages,
                    model: OPENAI_MODEL,
                    temperature,
                };
                if (jsonMode) {
                    params.response_format = { type: 'json_object' };
                }

                const completion = await openai.chat.completions.create(params);
                console.log("✅ OpenAI fallback successful.");
                return completion.choices[0].message.content;

            } catch (openaiError) {
                console.error("❌ Critical Error: Both Groq and OpenAI failed.");
                console.error("OpenAI Error:", openaiError.message);
                throw openaiError; // Propagate up to stop script or retry
            }
        } else {
            console.error("Groq Error (Non-429):", groqError.message);
            // Simple retry for non-rate limit errors? Or throw?
            // Let's throw for now to let the loop handle it
            throw groqError;
        }
    }
}

async function generateOutline(title, persona) {
  console.log(`Generating exhaustive outline for "${title}"...`);
  const prompt = `
    You are ${persona.role}.
    Context: ${FDA_CONTEXT}
    Task: Create a definitive, high-authority outline for a ${WORD_COUNT_TARGET}-word article titled "${title}".
    
    Requirements:
    - The outline must have at least 12-15 detailed sections (excluding Intro/Conclusion).
    - Each section must have 3-5 detailed sub-points.
    - Structure it logically: Theory -> Global Regulatory Landscapes -> Implementation -> Scientific Depth -> Case Studies.
    
    Output Format: JSON ONLY.
    {
      "sections": [
        { "title": "Section Title", "points": ["Detailed Subpoint 1", "Detailed Subpoint 2", ...] },
        ...
      ]
    }
  `;

  try {
      const content = await safeAiCall([{ role: 'user', content: prompt }], 0.4, true);
      return JSON.parse(content).sections;
  } catch (e) {
      console.error("Failed to generate/parse outline:", e.message);
      throw e;
  }
}

async function generateSection(title, section, index, total, persona) {
  console.log(`  > Generating section ${index + 1}/${total}: "${section.title}"...`);
  const prompt = `
    You are ${persona.role}.
    Article Title: "${title}"
    Current Section: "${section.title}"
    Sub-points: ${JSON.stringify(section.points)} 
    
    Instructions:
    - Write with **premium editorial authority** (Food Safety Magazine style).
    - Target Word Count: 400-500 words.
    - Tone: ${persona.tone}
    - Style: ${persona.style}
    - **Formatting Rules:**
      - Short paragraphs (3-4 lines max).
      - Use <h3> and <h4> to nest information.
      - Use bullet points (<ul>) or numbered lists (<ol>) frequently.
      - Use <strong> for emphasis on regulations and critical limits.
      - Include one <blockquote><strong>Expert Insight:</strong> ...</blockquote>
    - Cite specific regulations (21 CFR 117, EC 852/2004) where relevant.
    - Suggest an image placement with [IMAGE_SUGGESTION: description].
    
    Output: HTML string ONLY. No markdown code blocks.
  `;

  return await safeAiCall([{ role: 'user', content: prompt }], 0.6);
}

async function generateIntroAndMeta(title, persona, outline) {
    console.log("  > Generating Intro...");
    const prompt = `
      You are ${persona.role}.
      Article Title: "${title}"
      Outline: ${JSON.stringify(outline)}
      
      Task:
      1. Write a compelling, SEO-optimized Title.
      2. Write a 2-sentence Excerpt.
      3. Write the Introduction (approx 400 words) with short paragraphs and bullet points.
      
      Output Format: JSON ONLY.
      {
        "finalTitle": "...",
        "excerpt": "...",
        "introHtml": "..."
      }
    `;

    try {
        const content = await safeAiCall([{ role: 'user', content: prompt }], 0.5, true);
        const result = JSON.parse(content);
        result.introHtml = `<!-- Written by ${persona.role.split(',')[0]} -->\n` + result.introHtml;
        return result;
    } catch (e) {
        console.error("Failed to generate/parse intro:", e.message);
        throw e;
    }
}

async function generateFullArticle(title) {
    const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    const sections = await generateOutline(title, persona);
    const meta = await generateIntroAndMeta(title, persona, sections);
    
    let fullContent = meta.introHtml;
    let wordCount = 400;

    for (let i = 0; i < sections.length; i++) {
        const sectionContent = await generateSection(title, sections[i], i, sections.length, persona);
        fullContent += `\n${sectionContent}`;
        wordCount += sectionContent.split(/\s+/).length;
    }

    // Conclusion
    const conclusionPrompt = `
        You are ${persona.role}.
        Wrap up the article "${title}".
        Summarize key takeaways in bullet points.
        Output: HTML string.
    `;
    const conclusionContent = await safeAiCall([{ role: 'user', content: conclusionPrompt }], 0.5);
    fullContent += `\n${conclusionContent}`;
    wordCount += 200;

    const readTimeMinutes = Math.ceil(wordCount / 200);

    return {
        title: meta.finalTitle,
        excerpt: meta.excerpt,
        readTime: `${readTimeMinutes} min read`,
        content: fullContent
    };
}

// --- MAIN LOOP ---

async function main() {
    console.log("Reading src/data/articles.ts...");
    let fileContent = fs.readFileSync(ARTICLES_PATH, 'utf-8');

    // Regex to find article objects. 
    // This is a simplified regex and assumes standard formatting.
    // We look for: { slug: "...", title: "...", ... content: `...` }
    const articleRegex = /\{\s*slug:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["'],[\s\S]*?content:\s*`([\s\S]*?)`\s*\}/g;
    
    let match;
    const articlesToUpdate = [];

    // First pass: Identify candidates
    while ((match = articleRegex.exec(fileContent)) !== null) {
        const slug = match[1];
        const title = match[2];
        const currentContent = match[3];

        // Criteria: Content is short OR contains "pending"
        // 3000 chars is roughly 500 words. A full article should be >> 10000 chars.
        if (currentContent.length < 5000 || currentContent.includes("pending full editorial review")) {
            console.log(`[CANDIDATE] "${title}" (${slug}) - Length: ${currentContent.length}`);
            articlesToUpdate.push({ slug, title, fullMatch: match[0], startIndex: match.index });
        }
    }

    console.log(`Found ${articlesToUpdate.length} articles to regenerate.`);

    // Process each one (Limit to first 30 for safety, user can re-run)
    const batch = articlesToUpdate.slice(0, 30);
    
    for (const article of batch) {
        console.log(`\n--- Processing: ${article.title} ---`);
        try {
            const newData = await generateFullArticle(article.title);
            
            // Re-read file to ensure we work on latest version
            let currentFileContent = fs.readFileSync(ARTICLES_PATH, 'utf-8');
            
            // Find the specific block again to ensure we match the right one
            // We need a regex that matches THIS specific article block
            const specificRegex = new RegExp("\\{\\s*slug:\\s*[\"']" + article.slug + "[\"'][\\s\\S]*?content:\\s*`[\\s\\S]*?`\\s*\\}");
            const specificMatch = currentFileContent.match(specificRegex);
            
            if (specificMatch) {
                const oldBlock = specificMatch[0];
                
                // 1. Update Title if changed
                let newBlock = oldBlock.replace(/title:\s*["'][^"']+["']/, `title: "${newData.title}"`);
                
                // 2. Update Excerpt
                newBlock = newBlock.replace(/excerpt:\s*["'][^"']+["']/, `excerpt: "${newData.excerpt}"`);
                
                // 3. Update ReadTime
                newBlock = newBlock.replace(/readTime:\s*["'][^"']+["']/, `readTime: "${newData.readTime}"`);

                // 4. Update Content
                // Escape backticks and ${} in content
                const safeContent = newData.content.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
                
                // Replace content: `...` with content: `safeContent`
                // We use string concatenation for the regex replacement string to avoid syntax errors
                newBlock = newBlock.replace(/content:\s*`[\s\S]*?`/, "content: `" + safeContent + "`");

                // Write back
                const updatedFile = currentFileContent.replace(oldBlock, newBlock);
                fs.writeFileSync(ARTICLES_PATH, updatedFile);
                console.log(`[SAVED] Updated ${article.slug}`);
            } else {
                console.error(`Could not find block for ${article.slug} during save phase.`);
            }

        } catch (error) {
            console.error(`Failed to process ${article.title}:`, error);
        }
    }
}

main();