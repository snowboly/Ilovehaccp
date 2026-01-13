require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listSlugs() {
  const { data, error } = await supabase
    .from('articles')
    .select('slug, title')
    .order('slug');

  if (error) {
    console.error("Error fetching articles:", error);
    return;
  }

  console.log(`Total articles: ${data.length}`);
  data.forEach(a => console.log(`- ${a.slug} (${a.title})`));
}

listSlugs();
