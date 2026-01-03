const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

const targetTitle = process.argv[2];
const forcedSlug = process.argv[3];
if (!targetTitle) {
  console.log("Usage: node scripts/generate_expert_article.js \"Title of article\" [slug]");
  process.exit(1);
}

// --- CONFIGURATION ---
const WORD_COUNT_TARGET = 5000;
const MODEL = 'llama-3.3-70b-versatile';

// --- PERSONAS ---
const PERSONAS = [
  {
    id: 'academic',
    role: 'Dr. Eleanor Vance, PhD in Food Microbiology and Safety',
    tone: 'Academic, rigorous, evidence-based, precise.',
    style: 'Uses technical terminology, cites principles extensively, focuses on the "why" at a molecular/biological level.',
    instruction: 'Write as a professor educating advanced practitioners. Focus on the scientific validity of HACCP principles.'
  },
  {
    id: 'veteran',
    role: 'Marcus Thorne, 30-year Food Plant Operations Director',
    tone: 'Practical, authoritative, no-nonsense, experience-driven.',
    style: 'Focuses on implementation, common pitfalls, "war stories", and what actually happens on the factory floor vs. the binder.',
    instruction: 'Write as a mentor to a new Quality Manager. Focus on operational reality and avoiding costly shutdowns.'
  },
  {
    id: 'auditor',
    role: 'Sarah Jenkins, Lead Auditor for BRCGS and SQF',
    tone: 'Professional, compliance-focused, detail-oriented, strict.',
    style: 'Focuses on audit readiness, documentation, regulatory citations (CFR, EC 852/2004), and red flags.',
    instruction: 'Write as if preparing a client for a surprise inspection. Focus on "passing the audit" and regulatory alignment.'
  }
];

// --- KNOWLEDGE BASE ---
const FDA_CONTEXT = `
CORE HACCP PRINCIPLES (FDA/CODEX):
1. Conduct a hazard analysis. (Biological, Chemical, Physical).
2. Determine Critical Control Points (CCPs).
3. Establish Critical Limits.
4. Establish Monitoring Procedures.
5. Establish Corrective Actions.
6. Establish Verification Procedures.
7. Establish Record-Keeping and Documentation Procedures.

KEY GUIDELINES:
- Prerequisite Programs (GMPs) are the foundation.
- Training is non-negotiable.
- Management commitment is required.
- HACCP is specific to the product and process.
`;

// --- HELPER FUNCTIONS ---

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

async function generateOutline(title, persona) {
  console.log(`Generating outline for "${title}" with persona: ${persona.role}...`);
  const prompt = `
    You are ${persona.role}.
    Context: ${FDA_CONTEXT}
    Task: Create a comprehensive, detailed outline for a ${WORD_COUNT_TARGET}-word article titled "${title}".
    
    Requirements:
    - The outline must have at least 10-12 main sections (excluding Intro/Conclusion).
    - Each section must have 3-5 detailed sub-points.
    - Structure it logically: Theory -> Application -> Compliance -> Advanced Nuances -> Case Studies/Examples.
    - Ensure the scope covers standard US (FDA) and EU (EC) regulations. 
    
    Output Format: JSON ONLY.
    {
      "sections": [
        { "title": "Section Title", "points": ["Subpoint 1", "Subpoint 2", ...] },
        ...
      ]
    }
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
    temperature: 0.4,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0].message.content).sections;
}

async function generateSection(title, section, index, total, persona, previousContentSummary) {
  console.log(`Generating section ${index + 1}/${total}: "${section.title}"...`);
  const prompt = `
    You are ${persona.role}.
    Article Title: "${title}"
    Current Section: "${section.title}"
    Sub-points to cover: ${JSON.stringify(section.points)} 
    
    Context: ${FDA_CONTEXT}
    Previous Context: ${previousContentSummary}
    
    Instructions:
    - Write this specific section of the article with high editorial flair.
    - Target Word Count: 600-800 words.
    - Tone: ${persona.tone}
    - Style: ${persona.style} ${persona.instruction}
    - Format: HTML. Use <h2> for the section title, <h3> for subsections, <p> for text, <ul>/<li> for lists.
    - CRITICAL: Include one persona-specific insight block using <blockquote>. For example: "<blockquote><strong>Expert Insight:</strong> ...</blockquote>".
    - Use <strong> to highlight critical concepts, temperatures, or regulatory sections.
    - Break up long paragraphs. Use short, punchy sentences mixed with deep analysis.
    - Do NOT include an introduction to the whole article, just dive into this section's topic.
    - Cite regulations (e.g., "21 CFR 117") specifically where relevant. 
    
    Output: HTML string ONLY.
  `;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
    temperature: 0.6, // Slightly higher for more "editorial" flow
  });

  return completion.choices[0].message.content;
}

async function generateIntroAndMeta(title, persona, outline) {
    console.log("Generating Title, Excerpt, and Introduction...");
    const prompt = `
      You are ${persona.role}.
      Article Title: "${title}"
      Outline: ${JSON.stringify(outline)}
      
      Task:
      1. Write a compelling, SEO-optimized Title (can be slightly different from the input if better).
      2. Write a 2-sentence Excerpt/Meta Description.
      3. Write the Introduction section (approx 400 words) ensuring it hooks the reader and sets up the deep dive.
      
      Output Format: JSON ONLY.
      {
        "finalTitle": "...",
        "excerpt": "...",
        "introHtml": "..."
      }
    `;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
        temperature: 0.5,
        response_format: { type: 'json_object' }
      });
    
      const result = JSON.parse(completion.choices[0].message.content);
      // Ensure the persona name is in the intro so the UI detects it
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
    
    for (let i = 0; i < sections.length; i++) {
      const sectionContent = await generateSection(targetTitle, sections[i], i, sections.length, persona, previousContext);
      fullContent += `\n${sectionContent}`;
      // Update context (keep it brief to save tokens)
      previousContext = `Section "${sections[i].title}" covered: ${sections[i].points.join(', ')}.`;
    }

    // 5. Generate Conclusion
    console.log("Generating Conclusion...");
    const conclusionPrompt = `
        You are ${persona.role}.
        Wrap up the article "${targetTitle}".
        Summarize key takeaways from the perspective of your persona.
        Call to action: "Audit your current plan today" or similar.
        Output: HTML string.
    `;
    const conclusionCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: conclusionPrompt }],
        model: MODEL,
        temperature: 0.5
    });
    fullContent += `\n${conclusionCompletion.choices[0].message.content}`;

    // 6. Update File
    const slug = forcedSlug || slugify(targetTitle);
    const newArticle = {
        slug: slug,
        title: meta.finalTitle,
        category: "Compliance", // Default, could be inferred
        readTime: "45 min read", // Estimate based on length
        excerpt: meta.excerpt,
        publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: fullContent
    };

    console.log("Reading articles.ts...");
    let fileContent = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // Find if article exists
    // We look for: slug: "slug" or slug: 'slug'
    const slugRegex = new RegExp(`slug:\s*["']${slug}["']`);
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
