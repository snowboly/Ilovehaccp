require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const OPTIMIZATIONS = [
    {
        slug: 'is-haccp-mandatory-requirements-by-country-and-sector',
        title: "Do I Need a HACCP Plan in the UK? (Mandatory Requirements Explained)",
        excerpt: "Understand if your food business is legally required to have a HACCP plan in the UK and EU. A clear guide to Regulation (EC) 852/2004 for restaurants, retailers, and manufacturers."
    },
    {
        slug: 'what-regulators-really-expect-from-small-food-businesses',
        title: "HACCP for Small Food Businesses UK: What Inspectors Actually Expect",
        excerpt: "A practical guide for small food business owners on meeting HACCP requirements without the bureaucracy. Learn what Environmental Health Officers (EHO) look for in small operations."
    },
    {
        slug: 'haccp-documentation-checklist-for-inspections',
        title: "HACCP Checklist for Environmental Health Officers (EHO) Inspections",
        excerpt: "Be prepared for your next food safety inspection. A comprehensive checklist of the HACCP documentation and records an EHO will ask to see."
    },
    {
        slug: 'haccp-requirements-under-eu-regulation-852-2004',
        title: "HACCP Requirements Under Regulation (EC) 852/2004 Explained",
        excerpt: "A plain-English summary of the legal HACCP requirements for food businesses operating in the EU and UK. Understand Article 5 and your compliance obligations."
    }
];

async function optimize() {
    console.log("🚀 Optimizing article titles for search intent...");

    for (const opt of OPTIMIZATIONS) {
        const { error } = await supabase
            .from('articles')
            .update({ 
                title: opt.title, 
                excerpt: opt.excerpt 
            })
            .eq('slug', opt.slug);

        if (error) {
            console.error(`❌ Error updating ${opt.slug}:`, error.message);
        } else {
            console.log(`✅ Optimized: ${opt.slug}`);
        }
    }

    console.log("Done!");
}

optimize();
