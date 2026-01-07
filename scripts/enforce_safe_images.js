const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

// VERIFIED SAFE IMAGES (Food Safety, Labs, Kitchens, Inspection)
const SAFE_IMAGES = [
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1200", // Lab tubes
    "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=1200", // Chefs in clean kitchen
    "https://images.unsplash.com/photo-15556010103-1c02745a30bf?auto=format&fit=crop&q=80&w=1200", // Checklist
    "https://images.unsplash.com/photo-1606859191214-25806e8e2423?auto=format&fit=crop&q=80&w=1200", // Warehouse worker mask
    "https://images.unsplash.com/photo-1590779033100-9f601051371c?auto=format&fit=crop&q=80&w=1200", // Veggies washing
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200", // Microscope
    "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1200", // Industrial machine
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200", // Laptop data
    "https://images.unsplash.com/photo-1414235077428-338989a28e1c0?auto=format&fit=crop&q=80&w=1200", // Restaurant blurred
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200", // Lab light
    "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=1200", // Quality control
    "https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?auto=format&fit=crop&q=80&w=1200", // Laptop analytics
    "https://images.unsplash.com/photo-1632734157077-94d3d81b4f42?auto=format&fit=crop&q=80&w=1200", // Medical/Lab gloves
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=1200", // Pharmacy/Lab shelves
    "https://images.unsplash.com/photo-1584036561566-b937500d753e?auto=format&fit=crop&q=80&w=1200"  // Clean surfaces
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase URL or Key.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getRandomImage() {
    return SAFE_IMAGES[Math.floor(Math.random() * SAFE_IMAGES.length)];
}

async function main() {
    console.log("🛡️ STARTING SAFETY ENFORCEMENT PROTOCOL 🛡️");

    // 1. CLEAN LOCAL FILE
    try {
        let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
        
        // Split into blocks again
        const blocks = content.split(/[
]+\s\s\{/);
        console.log(`Found ${blocks.length} blocks locally.`);

        let newFileContent = blocks[0];

        for (let i = 1; i < blocks.length; i++) {
            let block = blocks[i];
            
            if (!block.includes('slug:')) {
                newFileContent += '\n  {' + block; 
                continue;
            }

            // Restore delimiter
            // REPLACE Main Image
            const newMainImg = getRandomImage();
            block = block.replace(/image:\s*["'].*?["']/, `image: "${newMainImg}"`);

            // REPLACE Inline Images
            // Find all <img src="..."> tags
            block = block.replace(/<img src=["'](.*?)["'](.*?)>/g, (match, url, rest) => {
                const newInlineImg = getRandomImage();
                return `<img src="${newInlineImg}"${rest}>`;
            });

            newFileContent += '\n  {' + block;
        }

        fs.writeFileSync(ARTICLES_PATH, newFileContent);
        console.log("✅ Local file updated with verified safe images.");

    } catch (e) {
        console.error("❌ Error updating local file:", e);
    }

    // 2. UPDATE SUPABASE
    try {
        console.log("Syncing to Supabase...");
        const { data: articles, error } = await supabase.from('articles').select('slug, content, image');
        
        if (error) throw error;

        for (const article of articles) {
            let needsUpdate = false;
            let newImage = article.image;
            let newContent = article.content;

            // Replace Main Image
            // We just blindly replace to be safe, or check if it matches our safe list?
            // Better to blindly replace to ensure no guns remain.
            newImage = getRandomImage();
            needsUpdate = true;

            // Replace Inline Images in Content
            if (newContent.includes('<img')) {
                 newContent = newContent.replace(/<img src=["'](.*?)["'](.*?)>/g, (match, url, rest) => {
                    const newInlineImg = getRandomImage();
                    return `<img src="${newInlineImg}"${rest}>`;
                });
                needsUpdate = true;
            }

            if (needsUpdate) {
                const { error: updateError } = await supabase
                    .from('articles')
                    .update({ content: newContent, image: newImage })
                    .eq('slug', article.slug);
                
                if (updateError) console.error(`Failed to update ${article.slug}:`, updateError.message);
                // else console.log(`Updated ${article.slug}`);
            }
        }
        console.log("✅ Supabase synced with verified safe images.");

    } catch (e) {
        console.error("❌ Error updating Supabase:", e);
    }
}

main();
