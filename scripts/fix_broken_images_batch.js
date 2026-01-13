require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { createClient: createPexels } = require('pexels');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const pexels = createPexels(process.env.PEXELS_API_KEY);

const TARGETS = [
    { slug: 'haccp-ccp-examples-uk-eu', query: 'chef cooking temperature thermometer' },
    { slug: 'is-haccp-mandatory-for-cafes', query: 'busy coffee shop barista' },
    { slug: 'haccp-requirements-for-drinks-only-businesses', query: 'fresh juice smoothie bar' }
];

async function searchPexels(query) {
    try {
        const result = await pexels.photos.search({ query, per_page: 1 });
        if (result.photos && result.photos.length > 0) {
            return result.photos[0].src.large;
        }
    } catch (e) {
        console.error("Pexels error:", e.message);
    }
    return "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg"; // Fallback
}

async function fixImages() {
    console.log("🚀 Fixing broken article images...");

    for (const target of TARGETS) {
        const newImage = await searchPexels(target.query);
        console.log(`📸 Found for ${target.slug}: ${newImage}`);

        const { error } = await supabase
            .from('articles')
            .update({ image: newImage })
            .eq('slug', target.slug);

        if (error) console.error(`❌ Error updating ${target.slug}:`, error.message);
        else console.log(`✅ Updated ${target.slug}`);
    }
}

fixImages();
