const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

// Collection of high-quality Food Safety/HACCP images from Unsplash
const HACCP_IMAGES = [
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200", // Lab inspection
    "https://images.unsplash.com/photo-1579154273821-5a9144226711?auto=format&fit=crop&q=80&w=1200", // Lab work
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200", // Logistics/Warehouse
    "https://images.unsplash.com/photo-1606859191214-25806e8e2423?auto=format&fit=crop&q=80&w=1200", // Warehouse worker
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200", // Scientific research
    "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&q=80&w=1200", // Industrial machine
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=1200", // Quality check
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"  // Market/Produce
];

const CAPTIONS = [
    "Implementing rigorous control measures is essential for compliance.",
    "Regular monitoring ensures critical limits are never breached.",
    "Supply chain transparency is a key requirement of modern food safety standards.",
    "Qualified personnel performing validation checks on the production line.",
    "Data-driven decision making reduces the risk of contamination.",
    "Advanced testing methodologies provide assurance of product safety.",
    "Documentation and record-keeping form the backbone of any HACCP plan.",
    "Visual inspection remains a critical first step in hazard identification."
];

function getRandomImage(index) {
    return HACCP_IMAGES[index % HACCP_IMAGES.length];
}

function getRandomCaption(index) {
    return CAPTIONS[index % CAPTIONS.length];
}

let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

// Regex to find each article object
const articleRegex = /\{\s*slug:[\s\S]*?content:\s*`([\s\S]*?)`\s*\}/g;

let updatedContent = content.replace(articleRegex, (match, bodyContent) => {
    // Skip if it already has figure or img tags
    if (bodyContent.includes('<img') || bodyContent.includes('<figure>')) {
        return match;
    }

    let modifiedBody = bodyContent;
    let imgCount = 0;

    // Inject an image after every 2nd H2 to avoid overcrowding
    // Regex matches <h2>...</h2> and captures it
    modifiedBody = modifiedBody.replace(/(<h2>.*?<\/h2>)/g, (h2Match) => {
        imgCount++;
        // Inject image for every even H2 (2, 4, 6...) or the very first one if it's long
        if (imgCount % 2 === 0 || imgCount === 1) {
            const imgUrl = getRandomImage(imgCount + Math.floor(Math.random() * 100));
            const caption = getRandomCaption(imgCount + Math.floor(Math.random() * 100));
            
            const imageHtml = `
      ${h2Match}
      <figure class="my-12">
        <img src="${imgUrl}" alt="Food safety illustration" class="w-full rounded-2xl shadow-lg" />
        <figcaption class="mt-4 text-center text-slate-500 italic text-sm">${caption}</figcaption>
      </figure>`;
            return imageHtml;
        }
        return h2Match;
    });

    return match.replace(bodyContent, modifiedBody);
});

fs.writeFileSync(ARTICLES_PATH, updatedContent);
console.log("Successfully injected images into existing articles.");
