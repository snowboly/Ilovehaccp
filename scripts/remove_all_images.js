
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

async function removeAllImages() {
  console.log("⚠️ STARTING EMERGENCY IMAGE REMOVAL ⚠️");
  
  // Debug Env Vars
  console.log("Environment Variables Check:");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Exists" : "Missing");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Exists" : "Missing");
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Exists" : "Missing");

  // 1. Clean local file src/data/articles.ts
  try {
    if (fs.existsSync(ARTICLES_PATH)) {
      console.log(`Reading ${ARTICLES_PATH}...`);
      let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

      // Remove top-level image property: image: "...",
      content = content.replace(/image:\s*["'].*?["'],\s*\n/g, '');
      
      // Remove inline HTML images
      content = content.replace(/<img[^>]*>/g, '<!-- Image removed for safety -->');
      
      fs.writeFileSync(ARTICLES_PATH, content);
      console.log("✅ Local file cleaned.");
    } else {
      console.warn("⚠️ Local articles.ts not found.");
    }
  } catch (err) {
    console.error("❌ Error cleaning local file:", err);
  }

  // 2. Clean Supabase Database
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn("⚠️ Skipping Database cleanup: Missing Supabase credentials.");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Fetching all articles from Supabase...");
    
    const { data: articles, error } = await supabase.from('articles').select('slug, content, image');

    if (error) {
        console.error("Error fetching articles:", error.message);
        return;
    }

    console.log(`Found ${articles.length} articles in DB.`);

    for (const article of articles) {
      let needsUpdate = false;
      let newContent = article.content;
      let newImage = article.image;

      if (article.image && article.image.length > 0) {
        newImage = null;
        needsUpdate = true;
      }

      if (article.content && article.content.includes('<img')) {
        newContent = article.content.replace(/<img[^>]*>/g, '<!-- Image removed for safety -->');
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log(`Cleaning images from: ${article.slug}`);
        const { error: updateError } = await supabase
          .from('articles')
          .update({ content: newContent, image: newImage })
          .eq('slug', article.slug);
        
        if (updateError) console.error(`Failed to update ${article.slug}:`, updateError.message);
      }
    }
    console.log("✅ Database cleaned.");

  } catch (err) {
    console.error("❌ Error cleaning database:", err);
  }
}

removeAllImages();

