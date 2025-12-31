const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

const titles = process.argv.slice(2);

if (titles.length === 0) {
  console.log("Usage: node scripts/generate_article.js \"Title 1\" \"Title 2\" ...");
  process.exit(1);
}

async function generateArticle(title) {
  console.log(`Generating article: "${title}"...`);
  
  const prompt = `
    You are an expert food safety scientist and editorial writer.
    Write a high-quality, long-form, scientific, yet accessible article about: "${title}".
    
    Target Audience: Food business owners, chefs, and quality managers.
    Tone: Professional, authoritative, educational, and slightly academic but practical.
    
    Output Format: JSON ONLY. No markdown fencing around the JSON.
    {
      "slug": "kebab-case-slug-based-on-title",
      "title": "The Full Title",
      "category": "One of: Fundamentals, Compliance, Operations, Technology, Microbiology, Culture",
      "readTime": "X min read",
      "excerpt": "A compelling 2-sentence summary.",
      "content": "HTML string. Use <h2>, <h3>, <p>, <ul>, <li>, <strong>. Do NOT use <h1> or <html> tags. Focus on depth, citing standards like Codex or FDA where relevant."
    }
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");
    
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error generating "${title}":`, error.message);
    return null;
  }
}

async function main() {
  const newArticles = [];

  for (const title of titles) {
    const article = await generateArticle(title);
    if (article) {
      article.publishedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      newArticles.push(article);
    }
  }

  if (newArticles.length === 0) return;

  // Read existing file
  let fileContent = fs.readFileSync(ARTICLES_PATH, 'utf-8');
  
  // Find the end of the array
  const insertIndex = fileContent.lastIndexOf('];');
  
  if (insertIndex === -1) {
    console.error("Could not find insertion point in articles.ts");
    return;
  }

  // Format new articles as TS string
  const newEntries = newArticles.map(a => `
  {
    slug: ${JSON.stringify(a.slug)},
    title: ${JSON.stringify(a.title)},
    category: ${JSON.stringify(a.category)},
    readTime: ${JSON.stringify(a.readTime)},
    excerpt: ${JSON.stringify(a.excerpt)},
    publishedAt: ${JSON.stringify(a.publishedAt)},
    content: \`${a.content.replace(/`/g, '\\\`').replace(/\${/g, '\\\${')}\`
  },`).join('');

  const updatedContent = fileContent.slice(0, insertIndex) + newEntries + fileContent.slice(insertIndex);

  fs.writeFileSync(ARTICLES_PATH, updatedContent);
  console.log(`Successfully added ${newArticles.length} articles to src/data/articles.ts`);
}

main();
