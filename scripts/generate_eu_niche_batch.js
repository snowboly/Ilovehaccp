const Groq = require('groq-sdk');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { createClient: createPexels } = require('pexels');
require('dotenv').config({ path: '.env.local' });

// --- CONFIG ---
const NICHES = [
    "Food Trucks",
    "Dark Kitchens and Ghost Kitchens",
    "Sushi Bars",
    "Artisanal Bakeries",
    "Gelato and Ice Cream Parlors",
    "Burger Vans",
    "Pizza Takeaways",
    "School Canteens",
    "Butcher Shops",
    "Fishmongers",
    "Craft Breweries",
    "Hospital Catering",
    "Care Home Kitchens",
    "Coffee Roasteries",
    "Sandwich Shops",
    "Juice and Smoothie Bars",
    "Mobile Coffee Carts",
    "Hotel Breakfast Buffets",
    "Corporate Offices Catering",
    "Pop-up Restaurants",
    "Meal Prep Services",
    "Home Bakers",
    "Street Food Stalls",
    "Farm Shops",
    "Delis and Charcuteries",
    "Seafood Restaurants",
    "Vegan and Plant-Based Cafes",
    "Event Catering",
    "Community Kitchens",
    "Nightclubs and Bars"
];

// --- SETUP ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pexels = createPexels(process.env.PEXELS_API_KEY);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PERSONAS = [
    { role: 'Dr. Joao, Scientific Lead & Founder', name: 'Dr. Joao' },
    { role: 'Dr. Margarida, Head of Compliance', name: 'Dr. Margarida' },
    { role: 'Dr. Fabio, Lead Auditor', name: 'Dr. Fabio' }
];

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

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

async function safeAiCall(messages, temperature = 0.5) {
    try {
        const completion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.3-70b-versatile',
            temperature
        });
        return completion.choices[0].message.content;
    } catch (e) {
        console.warn("Groq failed, switching to OpenAI...", e.message);
        const completion = await openai.chat.completions.create({
            messages,
            model: 'gpt-4o-mini',
            temperature
        });
        return completion.choices[0].message.content;
    }
}

async function generateArticle(niche) {
    const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    const title = `HACCP for ${niche}: A Complete EU Compliance Guide`;
    const slug = `haccp-for-${niche.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-eu`;
    
    console.log(`\n🚀 Generating: ${title} (${persona.name})...
`);

    // 1. CONTENT GENERATION
    let fullContent = "";
    
    // Intro
    const introPrompt = `Write a compelling Introduction for "${title}". Mention strict EU Regulation 852/2004 but emphasize practical compliance. Use <h3> headers.
    IMPORTANT: Format the output as HTML. Use <p> tags for paragraphs. Keep paragraphs short (max 3-4 sentences).`;
    fullContent += await safeAiCall([{ role: 'user', content: introPrompt }]);

    // Hazards
    const hazardsPrompt = `Write the "Specific Hazards" section for ${niche}. Focus on biological (Salmonella, Listeria), chemical (Cleaning agents), and physical risks relevant to this niche. Cite EC 852/2004. Use <h3> headers.
    IMPORTANT: Format as HTML. Use <p> tags. Keep paragraphs short and readable.`;
    fullContent += "\n" + await safeAiCall([{ role: 'user', content: hazardsPrompt }]);

    // CCPs
    const ccpPrompt = `Write the "Critical Control Points" section for ${niche}. detailed practical examples of CCPs (e.g. Cooking temp >75C, Cooling). Use <h3> headers and a list.
    IMPORTANT: Format as HTML. Use <p> tags. Use <ul>/<li> for lists. Keep paragraphs short.`;
    fullContent += "\n" + await safeAiCall([{ role: 'user', content: ccpPrompt }]);

    // Monitoring
    const monPrompt = `Write the "Monitoring & Record Keeping" section for ${niche}. Explain how to keep digital or paper logs to satisfy a health inspector. Mention traceability. Use <h3> headers.
    IMPORTANT: Format as HTML. Use <p> tags. Keep paragraphs short.`;
    fullContent += "\n" + await safeAiCall([{ role: 'user', content: monPrompt }]);

    // Conclusion
    const concPrompt = `Write a Conclusion for ${niche}. Call to action: "Use our free HACCP builder at ilovehaccp.com to generate your plan today."
    IMPORTANT: Format as HTML. Use <p> tags.`;
    fullContent += "\n" + await safeAiCall([{ role: 'user', content: concPrompt }]);

    // 2. IMAGE
    const image = await searchPexels(`${niche} food preparation`);

    const articleData = {
        slug,
        title,
        category: "Industry Guides",
        readTime: "8 min read",
        excerpt: `Essential HACCP guide for ${niche} owners in the EU. Learn about specific hazards, CCPs, and how to comply with EC 852/2004.`, 
        image,
        content: fullContent,
        publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    // Save to DB
    const { error } = await supabase.from('articles').upsert({
        slug: articleData.slug,
        title: articleData.title,
        category: articleData.category,
        read_time: articleData.readTime,
        excerpt: articleData.excerpt,
        image: articleData.image,
        content: articleData.content,
        published_at: articleData.publishedAt
    }, { onConflict: 'slug' });

    if (error) console.error("DB Save Error:", error.message);
    else console.log("✅ Saved to Database");

    return articleData;
}

async function main() {
    // Process new batch of niches (indices 20 to 29)
    for (let i = 20; i < 30; i++) {
        await generateArticle(NICHES[i]);
        await sleep(2000); // Respect rate limits
    }
    console.log("Done!");
}

main();