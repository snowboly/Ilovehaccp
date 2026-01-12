require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBreweries() {
  console.log(`Searching for 'Craft Breweries' in articles...`);

  // Search by title or content
  const { data, error } = await supabase
    .from('articles')
    .select('slug, title, content')
    .ilike('content', '%Craft Breweries%')
    .limit(1);

  if (error) {
    console.error("Error fetching article:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.error("No article found with 'Craft Breweries'.");
    return;
  }

  const article = data[0];
  console.log(`Found article: ${article.title} (${article.slug})`);
  
  // Check for ###
  if (article.content.includes('###')) {
      console.log("❌ WARNING: Found '###' in this article!");
      // Print context
      const idx = article.content.indexOf('###');
      console.log(article.content.substring(idx, idx + 100));
  } else {
      console.log("✅ No '###' found in this article.");
  }
}

checkBreweries();
