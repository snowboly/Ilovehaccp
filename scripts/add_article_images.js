const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

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

function reflowContent(content) {
    let processed = content.replace(/<p>(.*?)<\/p>/g, (match, text) => {
        if (text.length > 400) {
            const sentences = text.match(/[^.!?]+[.!?]+/g);
            if (sentences && sentences.length > 2) {
                const mid = Math.floor(sentences.length / 2);
                return `<p>${sentences.slice(0, mid).join(' ')}</p><p>${sentences.slice(mid).join(' ')}</p>`;
            }
        }
        return match;
    });
    processed = processed.replace(/<\/h([234])>/g, '</h$1>\n');
    return processed;
}

async function run() {
  console.log("Parsing articles.ts via regex blocks...");
  const content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
  const blocks = content.split('  {').filter(b => b.includes('slug:'));
  console.log(`Found ${blocks.length} blocks.`);

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
    console.log(`Updating [${i+1}/${blocks.length}]: ${title}`);

    let headerImage = await getPexelsImage(title, i % 5);
    if (usedImages.has(headerImage)) headerImage = await getPexelsImage(category, (i+2) % 15);
    usedImages.add(headerImage);

    articleContent = reflowContent(articleContent);
    const innerImage = await getPexelsImage(`${category} safety`, (i + 7) % 15);
    if (!articleContent.includes('<img')) {
        const pTags = articleContent.match(/<p>[\s\S]*?<\/p>/g);
        if (pTags && pTags.length > 2) {
            const imgHtml = `\n<figure class="my-12">\n  <img src="${innerImage}" alt="${title} documentation" class="w-full rounded-2xl shadow-lg" />\n</figure>\n`;
            articleContent = articleContent.replace(pTags[1], pTags[1] + imgHtml);
        }
    }

    processedArticles.push({
        slug, title, category, readTime, excerpt, publishedAt,
        image: headerImage,
        content: articleContent
    });

    await new Promise(r => setTimeout(r, 100));
  }

  let output = "export interface Article {\n  slug: string;\n  title: string;\n  category: string;\n  readTime: string;\n  excerpt: string;\n  image?: string;\n  content: string;\n  publishedAt: string;\n}\n\nexport const articles: Article[] = [\n";

  for (let i = 0; i < processedArticles.length; i++) {
      const a = processedArticles[i];
      output += "  {\n";
      output += "    slug: '" + a.slug + "',\n";
      output += "    title: '" + a.title.replace(/'/g, "'\'") + "',\n";
      output += "    category: '" + a.category + "',\n";
      output += "    readTime: '" + a.readTime + "',\n";
      output += "    excerpt: '" + a.excerpt.replace(/'/g, "'\'").replace(/\n/g, ' ') + "',\n";
      output += "    publishedAt: '" + a.publishedAt + "',\n";
      output += "    image: '" + a.image + "',\n";
      output += "    content: `" + a.content.replace(/`/g, '\`').replace(/\$/g, '\\$') + "`\n";
      output += "  }" + (i === processedArticles.length - 1 ? "" : ",") + "\n";
  }
  output += "];\n";

  fs.writeFileSync(ARTICLES_PATH, output);
  console.log("Restoration Complete!");
}

run();
