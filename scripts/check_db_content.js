require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContent() {
  const slug = 'haccp-for-fishmongers-eu';
  console.log(`Checking content for slug: ${slug}...`);

  const { data, error } = await supabase
    .from('articles')
    .select('content')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error("Error fetching article:", error);
    return;
  }

  if (!data) {
    console.error("No article found.");
    return;
  }

  const content = data.content;
  console.log("--- Content Snippet (Supabase) ---");
  
  // Look for the specific problematic section
  const searchStr = "Critical Control Points for Fishmongers";
  const index = content.indexOf(searchStr);
  
  if (index !== -1) {
      console.log(content.substring(index - 50, index + 200));
  } else {
      console.log("Could not find 'Critical Control Points for Fishmongers' in the text.");
      console.log("First 200 chars:", content.substring(0, 200));
  }
  
  console.log("----------------------------------");
  
  // Check for any ### occurrences
  if (content.includes('###')) {
      console.log("❌ WARNING: Found '###' in database content!");
      console.log(content.match(/###.{0,50}/g));
  } else {
      console.log("✅ No '###' found in database content.");
  }
}

checkContent();
