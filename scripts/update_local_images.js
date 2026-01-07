
const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

// --- SAFE IMAGE POOL ---
const SAFE_IMAGES = [
    "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=1200", // Chefs in clean kitchen
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1200", // Lab tubes
    "https://images.unsplash.com/photo-1555601568-c9e6f328489b?auto=format&fit=crop&q=80&w=1200", // Checklist
    "https://images.unsplash.com/photo-1606859191214-25806e8e2423?auto=format&fit=crop&q=80&w=1200", // Warehouse worker mask
    "https://images.unsplash.com/photo-1590779033100-9f601051371c?auto=format&fit=crop&q=80&w=1200", // Veggies washing
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200", // Microscope
    "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1200", // Industrial machine
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200", // Laptop data
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200", // Restaurant blurred
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200", // Lab light
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=1200", // Quality control
    "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&q=80&w=1200", // Laptop analytics
    "https://images.unsplash.com/photo-1632734157077-94d3d81b4f42?auto=format&fit=crop&q=80&w=1200", // Medical/Lab gloves
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=1200", // Pharmacy/Lab shelves
    "https://images.unsplash.com/photo-1584036561566-b937500d753e?auto=format&fit=crop&q=80&w=1200", // Clean surfaces
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200", // Planning/Docs
    "https://images.unsplash.com/photo-1566576912902-74161b04d543?auto=format&fit=crop&q=80&w=1200", // Warehouse
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200", // Grocery/Fresh
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=1200"  // Science/Lab
];

function getRandomImage() {
    return SAFE_IMAGES[Math.floor(Math.random() * SAFE_IMAGES.length)];
}

function main() {
    console.log("🛡️ STARTING LOCAL IMAGE OVERWRITE 🛡️");

    try {
        let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
        
        // 1. Regex to replace ALL main 'image: "..."' properties
        const mainImageRegex = /(image:\s*["'])(.*?)(["'])/g;
        content = content.replace(mainImageRegex, (match, prefix, oldUrl, suffix) => {
            const newUrl = getRandomImage();
            return `${prefix}${newUrl}${suffix}`;
        });
        console.log("✅ Replaced all main article images.");

        // 2. Regex to replace ALL inline <img src="..."> tags
        const inlineImageRegex = /(<img[^>]+src=["'])(.*?)(["'][^>]*>)/g;
        content = content.replace(inlineImageRegex, (match, prefix, oldUrl, suffix) => {
            const newUrl = getRandomImage();
            return `${prefix}${newUrl}${suffix}`;
        });
        console.log("✅ Replaced all inline content images.");

        // Save local file
        fs.writeFileSync(ARTICLES_PATH, content);
        console.log("💾 Local file saved successfully.");

    } catch (e) {
        console.error("❌ Critical Error:", e);
    }
}

main();
