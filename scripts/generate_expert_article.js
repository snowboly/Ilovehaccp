const Groq = require('groq-sdk');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

const targetTitle = process.argv[2];
const forcedSlug = process.argv[3];
if (!targetTitle) {
  console.log("Usage: node scripts/generate_expert_article.js \"Title of article\" [slug]");
  process.exit(1);
}

// --- CONFIGURATION ---
const WORD_COUNT_TARGET = 4500;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const OPENAI_MODEL = 'gpt-4o-mini';

// --- HELPER WITH RETRY & FALLBACK ---
async function safeAiCall(messages, temperature, jsonMode = false) {
    try {
        const params = { messages, model: GROQ_MODEL, temperature };
        if (jsonMode) params.response_format = { type: 'json_object' };
        const completion = await groq.chat.completions.create(params);
        return completion.choices[0].message.content;
    } catch (groqError) {
        if (groqError.status === 429) {
            console.warn("⚠️ Groq Rate Limit (429) hit. Switching to OpenAI fallback...");
            const params = { messages, model: OPENAI_MODEL, temperature };
            if (jsonMode) params.response_format = { type: 'json_object' };
            const completion = await openai.chat.completions.create(params);
            console.log("✅ OpenAI fallback successful.");
            return completion.choices[0].message.content;
        }
        throw groqError;
    }
}

// --- PERSONAS ---
const PERSONAS = [
    {
        id: 'joao_micro',
        role: 'Dr. Joao, Scientific Lead & Founder',
        name: 'Dr. Joao',
        persona: 'PhD in Food Microbiology, vision focused on democratizing safety standards.'
    },
    {
        id: 'auditor_margarida',
        role: 'Dr. Margarida, Head of Compliance',
        name: 'Dr. Margarida',
        persona: 'Senior Compliance Officer with 20+ years in lead auditing (BRCGS/SQF).'
    },
];

// --- KNOWLEDGE BASE ---
// ... (rest of knowledge base)

// --- HELPER FUNCTIONS ---

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function generateOutline(title, persona) {
  console.log(`Generating comprehensive outline for "${title}" with persona: ${persona.role}...`);
  const prompt = `
    You are ${persona.role}.
    Task: Create an exhaustive, high-authority outline for a ${WORD_COUNT_TARGET}-word article titled "${title}".
    
    Requirements:
    - The article must be a "definitive guide".
    - The outline must have at least 15-20 detailed sections/subsections.
    - Include sections for: Regulatory Frameworks (International/EU), Scientific Foundations, Implementation Challenges, Technological Advancements, and Future Outlook.
    - Structure it like a professional whitepaper or a lead article in Food Safety Magazine.
    
    Output Format: JSON ONLY.
    {
      "sections": [
        { "title": "Section Title", "points": ["Detailed Point 1", "Detailed Point 2", "Detailed Point 3", "Detailed Point 4", "Detailed Point 5"] },
        ...
      ]
    }
  `;

  const content = await safeAiCall([{ role: 'user', content: prompt }], 0.4, true);
  return JSON.parse(content).sections;
}

async function generateSection(title, section, index, total, persona, previousContentSummary) {
  console.log(`Generating section ${index + 1}/${total}: "${section.title}"...`);
  const prompt = `
    You are ${persona.role}.
    Article Title: "${title}"
    Current Section: "${section.title}"
    Sub-points to cover: ${JSON.stringify(section.points)}

    Instructions:
    - Write this section with **extreme depth and journalistic authority**.
    - Target Word Count for this section: 400-600 words.
    - Style: Modern editorial (clean, scannable, like Stripe or Linear documentation).
    - Use sophisticated transitions.

    **FORMATTING RULES (CRITICAL - FOLLOW EXACTLY):**

    1. PARAGRAPHS:
       - Maximum 2-3 sentences per <p> tag. NO WALLS OF TEXT.
       - Each paragraph should cover ONE idea only.
       - Add line breaks between paragraphs for readability.

    2. HEADINGS:
       - Use <h3> for subsections within this section.
       - Keep heading text concise (3-6 words).

    3. LISTS (use liberally):
       - Use <ul> with <li> for any list of 3+ items.
       - Each <li> should be concise (1-2 sentences max).
       - For definition-style lists, use format: <li><strong>Term:</strong> Definition here.</li>

    4. EMPHASIS:
       - Use <strong> ONLY for regulatory codes (EC 852/2004, BRCGS, etc.) and critical terms.
       - Do not overuse bold text.

    5. EXPERT CALLOUTS:
       - Include ONE <blockquote> per section with an expert insight.
       - Start with context keyword for styling: "Audit Tip:", "Research Note:", or "Important:"
       - Example: <blockquote><strong>Audit Tip:</strong> Always verify temperature logs are signed and dated.</blockquote>

    6. DO NOT:
       - Use markdown syntax (no ##, **, etc.)
       - Create paragraphs longer than 3 sentences
       - Use generic filler phrases
       - Include [IMAGE_SUGGESTION] comments

    Output: Clean HTML string ONLY. No markdown. No code blocks.
  `;

  return await safeAiCall([{ role: 'user', content: prompt }], 0.6);
}

async function generateIntroAndMeta(title, persona, outline) {
    console.log("Generating Title, Excerpt, and Introduction...");
    const prompt = `
      You are ${persona.role}.
      Article Title: "${title}"
      Outline: ${JSON.stringify(outline)}

      Task:
      1. Write a compelling, SEO-optimized Title (can be slightly different from the input if better).
      2. Write a 2-sentence Excerpt/Meta Description (engaging, not generic).
      3. Write the Introduction section (approx 300-400 words).

      **Introduction Format (CRITICAL):**
      - Start with a hook paragraph (2-3 sentences max) that addresses a pain point.
      - Second paragraph: Brief context on why this matters.
      - Include a "What you'll learn" section using this exact format:
        <h4>What you'll learn</h4>
        <ul>
          <li>Point one - specific and actionable</li>
          <li>Point two - specific and actionable</li>
          <li>Point three - specific and actionable</li>
        </ul>
      - Final paragraph: Brief transition to the first section.
      - NO paragraphs longer than 3 sentences.
      - Use HTML only, no markdown.

      Output Format: JSON ONLY.
      {
        "finalTitle": "...",
        "excerpt": "...",
        "introHtml": "..."
      }
    `;

    const content = await safeAiCall([{ role: 'user', content: prompt }], 0.5, true);
    const result = JSON.parse(content);
    result.introHtml = `<!-- Written by ${persona.role.split(',')[0]} -->\n` + result.introHtml;
    return result;
}

// --- MAIN PROCESS ---

async function main() {
  try {
    // 1. Select Persona
    const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    // Or force one for testing: const persona = PERSONAS[1];
    
    // 2. Generate Outline
    const sections = await generateOutline(targetTitle, persona);
    
    // 3. Generate Intro
    const meta = await generateIntroAndMeta(targetTitle, persona, sections);
    
    // 4. Loop Sections
    let fullContent = meta.introHtml;
    let previousContext = "Introduction covering the importance of the topic.";
    let totalWordCountEstimate = 400; // Start with intro
    
    for (let i = 0; i < sections.length; i++) {
      const sectionContent = await generateSection(targetTitle, sections[i], i, sections.length, persona, previousContext);
      fullContent += `\n${sectionContent}`;
      // Update context (keep it brief to save tokens)
      previousContext = `Section "${sections[i].title}" covered: ${sections[i].points.join(', ')}.`;
      
      // Rough word count update
      totalWordCountEstimate += sectionContent.split(/\s+/).length;
    }

    // 5. Generate Conclusion
    console.log("Generating Conclusion...");
    const conclusionPrompt = `
        You are ${persona.role}.
        Write the conclusion for the article "${targetTitle}".

        **Format (CRITICAL):**
        1. Start with <h2>Key Takeaways</h2>
        2. Use a <ul> with 4-6 bullet points summarizing the most important points.
        3. Each bullet should be 1 sentence, specific and actionable.
        4. End with a brief (2-3 sentence) call-to-action paragraph encouraging readers to take action.
        5. NO markdown. HTML only.
        6. Keep total length under 200 words.

        Output: Clean HTML string ONLY.
    `;
    const conclusionContent = await safeAiCall([{ role: 'user', content: conclusionPrompt }], 0.5);
    fullContent += `\n${conclusionContent}`;
    totalWordCountEstimate += conclusionContent.split(/\s+/).length;

    // Calculate Read Time
    const readTimeMinutes = Math.ceil(totalWordCountEstimate / 200);
    const readTime = `${readTimeMinutes} min read`;

    // 6. Update File
    const slug = forcedSlug || slugify(targetTitle);
    const newArticle = {
        slug: slug,
        title: meta.finalTitle,
        category: "Compliance", // Default, could be inferred
        readTime: readTime,
        excerpt: meta.excerpt,
        publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: fullContent
    };

    console.log("Reading articles.ts...");
    let fileContent = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // Find if article exists
    // We look for: slug: "slug" or "slug": "slug"
    const slugRegex = new RegExp(`["']?slug["']?\s*:\s*["']${slug}["']`);
    const match = fileContent.match(slugRegex);

    if (match) {
        console.log("Article exists. Replacing...");
        // This is the tricky part: finding the bounds of the object.
        // We'll search backwards from the match index for the opening `{
        let startIndex = match.index;
        while (fileContent[startIndex] !== '{' && startIndex > 0) {
            startIndex--;
        }

        // Now search forwards for the balancing `}`
        let braceCount = 0;
        let endIndex = startIndex;
        let foundStart = false;
        
        for (let i = startIndex; i < fileContent.length; i++) {
            if (fileContent[i] === '{') {
                braceCount++;
                foundStart = true;
            } else if (fileContent[i] === '}') {
                braceCount--;
            }

            if (foundStart && braceCount === 0) {
                endIndex = i + 1;
                break;
            }
        }

        // Construct the new object string
        // We use backticks for content but need to escape existing backticks/vars
        const safeContent = newArticle.content.replace(/`/g, '\`').replace(/\${/g, '\\${');
        const newObjectString = `{
    slug: "${newArticle.slug}",
    title: "${newArticle.title}",
    category: "${newArticle.category}",
    readTime: "${newArticle.readTime}",
    excerpt: "${newArticle.excerpt}",
    publishedAt: "${newArticle.publishedAt}",
    content: \`${safeContent}\`
  }`; 
        const updatedFileContent = fileContent.substring(0, startIndex) + newObjectString + fileContent.substring(endIndex);
        fs.writeFileSync(ARTICLES_PATH, updatedFileContent);

    } else {
        console.log("New article. Appending...");
        const insertIndex = fileContent.lastIndexOf('];');
        const safeContent = newArticle.content.replace(/`/g, '\`').replace(/\${/g, '\\${');
        const newEntry = `
  {
    slug: "${newArticle.slug}",
    title: "${newArticle.title}",
    category: "${newArticle.category}",
    readTime: "${newArticle.readTime}",
    excerpt: "${newArticle.excerpt}",
    publishedAt: "${newArticle.publishedAt}",
    content: \`${safeContent}\`
  },`;
        const updatedFileContent = fileContent.slice(0, insertIndex) + newEntry + fileContent.slice(insertIndex);
        fs.writeFileSync(ARTICLES_PATH, updatedFileContent);
    }

    console.log(`SUCCESS! Article "${targetTitle}" generated and saved.`);

  } catch (error) {
    console.error("Error:", error);
  }
}

main();
