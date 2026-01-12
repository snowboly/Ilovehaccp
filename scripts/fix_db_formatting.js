require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDbFormatting() {
  console.log("Fetching all articles from DB...");
  
  // Fetch slug and content for ALL articles
  // We need to page if there are many, but 1000 limit is likely fine for now.
  const { data: articles, error } = await supabase
    .from('articles')
    .select('slug, title, content');

  if (error) {
    console.error("Error fetching articles:", error);
    return;
  }

  console.log(`Found ${articles.length} articles.`);
  
  let fixedCount = 0;

  for (const article of articles) {
    let content = article.content;
    let originalContent = content;

    // 1. Fix Headers: ### Header -> <h3>Header</h3>
    // Pattern: <p>### Header</p>
    // Escape the slash in </p>
    content = content.replace(/<p>#{2,3}\s*(.*?)<\/p>/g, '<h3>$1</h3>');
    
    // Pattern: "Loose" ### Header (not wrapped in p tags)
    // We match start of line or after newline
    content = content.replace(/(^|\n)#{2,3}\s*([^\n<]+)/g, '$1<h3>$2</h3>');

    // 2. Fix Bold: ** Text ** -> <strong>Text</strong>
    content = content.replace(/\*\*:\s*([^\s<])/g, '**: $1'); // Ensure space before fixing
    content = content.replace(/\*\*\s*(.*?)\s*\*\*/g, '<strong>$1</strong>');

    // 3. Add space after stray ### or ** if they persist (cleanup)
    content = content.replace(/(#{2,3})([^\s#])/g, '$1 $2');
    
    // Clean up empty paragraphs that might have been left behind
    content = content.replace(/<p>\s*<\/p>/g, '');

    if (content !== originalContent) {
      console.log(`Fixing formatting for: ${article.title} (${article.slug})`);
      
      const { error: updateError } = await supabase
        .from('articles')
        .update({ content })
        .eq('slug', article.slug);

      if (updateError) {
        console.error(`Failed to update ${article.slug}:`, updateError);
      } else {
        fixedCount++;
      }
    }
  }

  console.log(`Done. Fixed ${fixedCount} articles directly in the database.`);
}

fixDbFormatting();