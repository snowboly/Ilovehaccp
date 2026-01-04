const fs = require('fs');
const path = require('path');
const https = require('https');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

async function getPexelsImage(query, index = 0) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=20`,
      headers: { Authorization: PEXELS_API_KEY }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.photos && json.photos.length > index) {
            resolve(json.photos[index].src.large);
          } else if (json.photos && json.photos.length > 0) {
            resolve(json.photos[0].src.large);
          } else {
            resolve('https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
          }
        } catch (e) {
          resolve('https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
        }
      });
    }).on('error', () => {
      resolve('https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
    });
  });
}

async function improveContent(article) {
    console.log(`  > Using OpenAI to improve content for: ${article.title}`);
    const prompt = `
    You are a professional editor for a high-authority Food Safety Magazine.
    Task:
    1. Reflow the following HTML content to make it more readable.
    2. Break long paragraphs into shorter ones (max 3-4 lines).
    3. Ensure technical terms (like Salmonella, 21 CFR 117, etc) are in <strong> tags.
    4. Return the HTML content exactly as provided but improved for readability.
    5. Provide two specific, unique Pexels search queries: one for the article header and one for an illustrative image inside the article.
    
    Article Title: "${article.title}"
    Current Content:
    ${article.content}
    
    Output Format: JSON ONLY
    {
      "improvedContent": "...",
      "headerQuery": "...",
      "innerQuery": "..."
    }
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' }
        });
        return JSON.parse(completion.choices[0].message.content);
    } catch (e) {
        console.error("OpenAI Error:", e.message);
        return {
            improvedContent: article.content,
            headerQuery: article.title,
            innerQuery: "food safety inspection"
        };
    }
}

async function run() {
  console.log("Starting Article Polish Process...");
  const content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
  const blocks = content.split('  {').filter(b => b.includes('slug:'));
  console.log(`Found ${blocks.length} articles to process.`);

  const processedArticles = [];
  const usedImages = new Set();

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const slug = (block.match(/slug:\s*['"](.*?)['"]/) || [])[1];
    const title = (block.match(/title:\s*["'](.*?)["']/) || [])[1];
    const category = (block.match(/category:\s*['"](.*?)['"]/) || [])[1];
    const readTime = (block.match(/readTime:\s*['"](.*?)['"]/) || [])[1];
    const excerpt = (block.match(/excerpt:\s*["']([\s\S]*?)["']\s*,/) || [])[1];
    const publishedAt = (block.match(/publishedAt:\s*['"](.*?)['"]/) || [])[1];
    
    const contentStart = block.indexOf('content: `') + 10;
    const contentEnd = block.lastIndexOf('`');
    let articleContent = block.substring(contentStart, contentEnd);

    if (!slug || !title) continue;
    console.log(`\n[${i+1}/${blocks.length}] Processing: ${title}`);

    const result = await improveContent({ title, content: articleContent });
    
    let headerImage = await getPexelsImage(result.headerQuery, 0);
    if (usedImages.has(headerImage)) headerImage = await getPexelsImage(result.headerQuery, (i % 5) + 1);
    usedImages.add(headerImage);

    let innerImage = await getPexelsImage(result.innerQuery, 0);
    
    let finalContent = result.improvedContent;
    // Remove any existing figure/img tags to avoid duplicates
    finalContent = finalContent.replace(/<figure[\s\S]*?<\/figure>/g, '');
    finalContent = finalContent.replace(/<img[\s\S]*?>/g, '');

    // Inject inner image after second paragraph
    const pTags = finalContent.match(/<p>[\s\S]*?<\/p>/g);
    if (pTags && pTags.length > 2) {
        const imgHtml = `\n<figure class="my-12">\n  <img src="${innerImage}" alt="${title} technical context" class="w-full rounded-2xl shadow-lg" />\n</figure>\n`;
        finalContent = finalContent.replace(pTags[1], pTags[1] + imgHtml);
    }

    processedArticles.push({
        slug, title, category, readTime, excerpt, publishedAt,
        image: headerImage,
        content: finalContent
    });

    // Short sleep to respect rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log("Generating final src/data/articles.ts...");
  let output = "export interface Article {\n  slug: string;\n  title: string;\n  category: string;\n  readTime: string;\n  excerpt: string;\n  image?: string;\n  content: string;\n  publishedAt: string;\n}\n\nexport const articles: Article[] = [\n";

  for (let i = 0; i < processedArticles.length; i++) {
      const a = processedArticles[i];
      // Safely build the object string
      output += "  {\n";
      output += "    slug: " + JSON.stringify(a.slug) + ",\n";
      output += "    title: " + JSON.stringify(a.title) + ",\n";
      output += "    category: " + JSON.stringify(a.category) + ",\n";
      output += "    readTime: " + JSON.stringify(a.readTime) + ",\n";
      output += "    excerpt: " + JSON.stringify(a.excerpt) + ",\n";
      output += "    publishedAt: " + JSON.stringify(a.publishedAt) + ",\n";
      output += "    image: " + JSON.stringify(a.image) + ",\n";
      output += "    content: " + JSON.stringify(a.content) + "\n";
      output += "  }" + (i === processedArticles.length - 1 ? "" : ",") + "\n";
  }
  output += "];\n";

  fs.writeFileSync(ARTICLES_PATH, output);
  console.log("SUCCESS! Platform content and personas updated.");
}

run();
