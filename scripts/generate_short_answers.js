const Groq = require('groq-sdk');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const ANSWERS = [
    {
        title: "7 Real-World CCP Examples for Food Businesses (UK & EU)",
        slug: "haccp-ccp-examples-uk-eu",
        excerpt: "What is a Critical Control Point? See 7 practical CCP examples including cooking temperatures, chilling times, and allergen control for UK & EU businesses."
    },
    {
        title: "Is HACCP Mandatory for Cafes? (Official UK/EU Requirements)",
        slug: "is-haccp-mandatory-for-cafes",
        excerpt: "Do cafes and coffee shops legally need a HACCP plan? Learn about Regulation 852/2004 requirements and how 'Safer Food, Better Business' fits in."
    },
    {
        title: "Do I Need HACCP if I Only Sell Drinks? (Rules for Cold vs. Hot Beverages)",
        slug: "haccp-requirements-for-drinks-only-businesses",
        excerpt: "If your business only serves beverages, do you still need a HACCP plan? We explain the hygiene rules for bottled drinks, fresh juices, and milk-based coffees."
    }
];

async function safeAiCall(messages) {
    try {
        const completion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3
        });
        return completion.choices[0].message.content;
    } catch (e) {
        const completion = await openai.chat.completions.create({
            messages,
            model: 'gpt-4o-mini',
            temperature: 0.3
        });
        return completion.choices[0].message.content;
    }
}

async function generate() {
    for (const ans of ANSWERS) {
        console.log(`🚀 Generating: ${ans.title}...`);
        
        const content = await safeAiCall([{
            role: 'user',
            content: `Write a short, authoritative, and direct answer for the question: "${ans.title}".
            Use <h3> headers. Use <ul>/<li> for lists. Keep it to approx 800-1000 words. 
            Focus on UK/EU Regulation 852/2004. 
            Style: Professional, helpful, "Wikipedia-style". 
            Include a "Key Takeaway" box style at the start.
            Mention at the end: "Save time by using the iLoveHACCP builder to generate your plan in minutes."
            Format as HTML.`
        }]);

        const { error } = await supabase.from('articles').upsert({
            slug: ans.slug,
            title: ans.title,
            category: "Compliance Basics",
            read_time: "5 min read",
            excerpt: ans.excerpt,
            image: "https://images.pexels.com/photos/7095/people-coffee-tea-meeting.jpg",
            content: content,
            published_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }, { onConflict: 'slug' });

        if (error) console.error(`❌ Error saving ${ans.slug}:`, error.message);
        else console.log(`✅ Saved: ${ans.slug}`);
    }
}

generate();
