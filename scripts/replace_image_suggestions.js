const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

// Curated list of high-quality Unsplash images for food safety contexts
const IMAGE_LIBRARY = [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200", // Lab inspection
    "https://images.unsplash.com/photo-1579154273821-5a9144226711?auto=format&fit=crop&q=80&w=1200", // Lab work
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200", // Logistics/Warehouse
    "https://images.unsplash.com/photo-1606859191214-25806e8e2423?auto=format&fit=crop&q=80&w=1200", // Warehouse worker
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200", // Scientific research
    "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=1200", // Industrial machine
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=1200", // Quality check
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200", // Fresh Produce
    "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=1200", // Factory line
    "https://images.unsplash.com/photo-1615937651188-cdc296f4d0c8?auto=format&fit=crop&q=80&w=1200"  // Meat processing
];

let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

// Regex to find [IMAGE_SUGGESTION: description]
// Captures the description in group 1
const suggestionRegex = /\[IMAGE_SUGGESTION:\s*(.*?)\]/g;

let replaceCount = 0;

const updatedContent = content.replace(suggestionRegex, (match, description) => {
    // Pick an image deterministically based on the description length so it doesn't change on re-runs
    const imageIndex = description.length % IMAGE_LIBRARY.length;
    const imageUrl = IMAGE_LIBRARY[imageIndex];
    replaceCount++;

    return `
      <figure class="my-12">
        <img src="${imageUrl}" alt="${description}" class="w-full rounded-2xl shadow-lg" />
        <figcaption class="mt-4 text-center text-slate-500 italic text-sm">${description}</figcaption>
      </figure>`;
});

fs.writeFileSync(ARTICLES_PATH, updatedContent);
console.log(`Replaced ${replaceCount} image suggestions with actual images.`);
