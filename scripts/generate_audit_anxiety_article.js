const Groq = require('groq-sdk');
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// --- SETUP ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const ARTICLE = {
    title: "What Happens If Your HACCP Plan Is Incomplete? (UK/EU Inspection Guide)",
    slug: "failed-haccp-inspection-consequences-uk",
    category: "Audit & Compliance",
    image: "https://images.pexels.com/photos/8853502/pexels-photo-8853502.jpeg" // Inspector/checklist image
};

async function safeAiCall(messages) {
    try {
        const completion = await groq.chat.completions.create({
            messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5
        });
        return completion.choices[0].message.content;
    } catch (e) {
        console.warn("Groq failed, switching to OpenAI...", e.message);
        const completion = await openai.chat.completions.create({
            messages,
            model: 'gpt-4o-mini',
            temperature: 0.5
        });
        return completion.choices[0].message.content;
    }
}

async function generate() {
    console.log(`🚀 Generating: ${ARTICLE.title}...`);

    let fullContent = "";

    // 1. Introduction (Empathy + Reality)
    fullContent += await safeAiCall([{
        role: 'user', 
        content: `Write a reassuring but factual Introduction for an article titled "${ARTICLE.title}". 
        Acknowledge the stress of a food hygiene inspection (EHO visit in UK). 
        State clearly that a "missing" or "incomplete" HACCP plan is a common reason for a low hygiene rating (0-2 stars).
        Use <h3> headers. Format as HTML <p> tags.` 
    }]);

    // 2. The Legal Consequences (The "Scary" Part - but factual)
    fullContent += "\n" + await safeAiCall([{
        role: 'user', 
        content: `Write a section "Legal Consequences of an Incomplete Plan". 
        Explain the difference between:
        1. "Hygiene Improvement Notice" (Common, gives you time to fix it).
        2. "Remedial Action Notice" (Stop using specific equipment).
        3. "Hygiene Emergency Prohibition Notice" (Immediate closure - rare, for imminent risk).
        Emphasize that for paperwork issues, inspectors usually give you a chance to fix it *if* there is no immediate health risk.
        Use <h3> headers. Format as HTML.` 
    }]);

    // 3. What "Incomplete" Actually Means
    fullContent += "\n" + await safeAiCall([{
        role: 'user', 
        content: `Write a section "What Counts as an 'Incomplete' Plan?". 
        List common failures:
        - Blank monitoring sheets (Temperature logs empty).
        - "Generic" plan (Downloaded a template but didn't change "Business Name" or menu items).
        - Missing allergen matrix.
        - Staff not trained on the CCPs.
        Use <h3> headers and <ul> list. Format as HTML.` 
    }]);

    // 4. How to Fix It Quickly (The Solution)
    fullContent += "\n" + await safeAiCall([{
        role: 'user', 
        content: `Write a section "How to Fix a Failed Inspection Quickly". 
        Steps:
        1. Don't panic. Read the inspector's report.
        2. Use a digital tool to generate a compliant plan tailored to your menu (Mention iLoveHACCP gently as a free option).
        3. Print it out and START RECORDING logs immediately.
        4. Request a re-score inspection (UK "Right to Reply").
        Use <h3> headers. Format as HTML.` 
    }]);

    // Save to DB
    const { error } = await supabase.from('articles').upsert({
        slug: ARTICLE.slug,
        title: ARTICLE.title,
        category: ARTICLE.category,
        read_time: "6 min read",
        excerpt: "Don't panic if your HACCP plan was flagged during an inspection. Learn the difference between an Improvement Notice and immediate closure, and how to fix your documentation quickly to restore your hygiene rating.",
        image: ARTICLE.image,
        content: fullContent,
        published_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }, { onConflict: 'slug' });

    if (error) console.error("❌ DB Save Error:", error.message);
    else console.log("✅ Article Saved to Database");
}

generate();
