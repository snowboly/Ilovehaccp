require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function injectLinks() {
    console.log("🔗 Starting Internal Link Injection...");

    // 1. Fetch all articles
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, slug, title, category, content');

    if (error) {
        console.error("❌ Error fetching articles:", error);
        return;
    }

    console.log(`Processing ${articles.length} articles...`);

    const PILLAR_LINK = '<a href="/requirements-eu-uk">HACCP Requirements in the UK & EU (Regulation 852/2004)</a>';
    const PRODUCT_LINK = '<a href="/builder">HACCP Builder</a>';

    for (const article of articles) {
        // Skip if links already exist
        if (article.content.includes('/requirements-eu-uk') && article.content.includes('/builder')) {
            console.log(`⏭️  Skipping ${article.slug} (Links already present)`);
            continue;
        }

        // Find a related article (simple logic: same category, different ID)
        const related = articles.find(a => a.category === article.category && a.id !== article.id) || 
                        articles.find(a => a.id !== article.id); // Fallback to any other

        let newContent = article.content;

        // Append "Further Reading" section if not present
        const injectionHtml = `
<h3>Further Reading & Tools</h3>
<p>Ensure your business is fully compliant by exploring our other resources:</p>
<ul>
    <li><strong>Legal Guide:</strong> ${PILLAR_LINK} - A plain English explanation of what the law requires.</li>
    <li><strong>Free Tool:</strong> Use our ${PRODUCT_LINK} to generate a compliant plan in minutes.</li>
    ${related ? `<li><strong>Related Article:</strong> <a href="/resources/${related.slug}">${related.title}</a></li>` : ''}
</ul>`;

        newContent += injectionHtml;

        // Update DB
        const { error: updateError } = await supabase
            .from('articles')
            .update({ content: newContent })
            .eq('id', article.id);

        if (updateError) {
            console.error(`❌ Failed to update ${article.slug}:`, updateError.message);
        } else {
            console.log(`✅ Linked injected: ${article.slug}`);
        }
    }

    console.log("🎉 Internal linking complete!");
}

injectLinks();
