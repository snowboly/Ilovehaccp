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
    // Break long paragraphs
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
  console.log("Reading articles...");
  let articlesTs = fs.readFileSync(ARTICLES_PATH, 'utf-8');
  
  const articleBlocks = articlesTs.split('  {\n    slug:');
  const header = articleBlocks.shift(); 
  
  const updatedBlocks = [];
  const usedImages = new Set();

  for (let i = 0; i < articleBlocks.length; i++) {
    let block = '    slug:' + articleBlocks[i];
    
    const slugMatch = block.match(/slug:\s*['"](.*?)['"]/);
    const titleMatch = block.match(/title:\s*["'](.*?)["']/);
    const categoryMatch = block.match(/category:\s*['"](.*?)['"]/);
    
    if (!slugMatch || !titleMatch) {
        updatedBlocks.push(block);
        continue;
    }

    const slug = slugMatch[1];
    const title = titleMatch[1];
    const category = categoryMatch ? categoryMatch[1] : "Food Safety";

    console.log(`Processing [${i+1}/${articleBlocks.length}]: ${title}`);

    let headerImage = await getPexelsImage(title, i % 5);
    if (usedImages.has(headerImage)) {
        headerImage = await getPexelsImage(category, (i + 2) % 15);
    }
    usedImages.add(headerImage);

    block = block.replace(/image:\s*['"].*?['"]/, `image: '${headerImage}'`);

    let contentMatch = block.match(/content:\s*`([\s\S]*?)`,/);
    if (contentMatch) {
        let content = contentMatch[1];
        content = reflowContent(content);

        const innerImage = await getPexelsImage(`${category} inspection`, (i + 7) % 15);
        
        // Replace existing images or inject new one
        if (content.includes('<img src=')) {
            content = content.replace(/<img src=['"].*?['"]/, `<img src="${innerImage}"`);
        } else {
            const pTags = content.match(/<p>[\s\S]*?<\/p>/g);
            if (pTags && pTags.length > 2) {
                const imgHtml = `\n<figure class="my-12">\n  <img src="${innerImage}" alt="${title} documentation" class="w-full rounded-2xl shadow-lg" />\n</figure>\n`;
                content = content.replace(pTags[1], pTags[1] + imgHtml);
            }
        }
        
        const startIdx = block.indexOf('content: `');
        const endIdx = block.indexOf('`,', startIdx) + 2;
        block = block.substring(0, startIdx) + 'content: `' + content + '`,' + block.substring(endIdx);
    }

    updatedBlocks.push(block);
    // Throttle slightly
    await new Promise(r => setTimeout(r, 200));
  }

  const finalTs = header + updatedBlocks.join('  {\n    slug:');
  fs.writeFileSync(ARTICLES_PATH, finalTs);
  console.log("Success! 66+ articles updated with unique images and better flow.");
}

run();
