
const fs = require('fs');
const ARTICLES_PATH = 'src/data/articles.ts';
let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

// Use a simpler regex to catch Pexels URLs and replace with a guaranteed safe Unsplash image
// (A clean lab surface / professional kitchen image)
const safeImg = "https://images.unsplash.com/photo-1584036561566-b937500d753e?auto=format&fit=crop&q=80&w=1200";

// Replace any pexels image URL
const pexelsRegex = /https:\/\/images\.pexels\.com\/photos\/\d+\/?[^"`']*/g;
const count = (content.match(pexelsRegex) || []).length;
content = content.replace(pexelsRegex, safeImg);

fs.writeFileSync(ARTICLES_PATH, content);
console.log(`Replaced ${count} Pexels URLs with safe Unsplash fallback.`);
