const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

function clean() {
    console.log("Reading articles.ts...");
    const content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // Find all article blocks
    const blocks = content.match(/\{\s*slug:[\s\S]*?content:\s*`[\s\S]*?`[\s\S]*?\}/g);
    
    if (!blocks) {
        console.error("No articles found!");
        return;
    }

    console.log(`Found ${blocks.length} blocks. Deduplicating...`);
    
    const uniqueMap = new Map();
    
    for (const block of blocks) {
        const slugMatch = block.match(/slug:\s*["']([^"']+)["']/);
        if (slugMatch) {
            const slug = slugMatch[1];
            uniqueMap.set(slug, block);
        }
    }

    let newContent = "export interface Article {\n" +
        "  slug: string;\n" +
        "  title: string;\n" +
        "  category: string;\n" +
        "  readTime: string;\n" +
        "  excerpt: string;\n" +
        "  content: string;\n" +
        "  publishedAt: string;\n" +
        "}\n" +
        "export const articles: Article[] = [\n";

    for (const block of uniqueMap.values()) {
        const getField = (name, isBacktick = false) => {
            let pattern;
            if (isBacktick) {
                pattern = new RegExp(name + ':\s*`([\s\S]*?)`', 'g');
            } else {
                // Use a character class that excludes quotes
                pattern = new RegExp(name + ':\s*["\']([^"\']*)["\']', 'g');
            }
            let val = null;
            let m;
            while ((m = pattern.exec(block)) !== null) {
                val = m[1];
            }
            return val;
        };

        const slug = getField('slug');
        const title = getField('title');
        const category = getField('category');
        const readTime = getField('readTime');
        const excerpt = getField('excerpt');
        const publishedAt = getField('publishedAt') || 'Jan 3, 2026';
        let body = getField('content', true);

        if (!slug || !title || !body) continue;

        // Strip HTML comments
        body = body.replace(/<!--[\s\S]*?-->/g, '');

        newContent += "  {\n" +
            "    slug: \"" + slug + "\",\n" +
            "    title: \"" + title.replace(/\"/g, "'") + "\",\n" +
            "    category: \"" + (category || "Compliance") + "\",\n" +
            "    readTime: \"" + (readTime || "15 min read") + "\",\n" +
            "    excerpt: \"" + (excerpt || "").replace(/\"/g, "'") + "\",\n" +
            "    publishedAt: \"" + publishedAt + "\",\n" +
            "    content: `" + body.replace(/`/g, "\\`").replace(/\$\{/g, "\\${ப்புகளை") + "`\n" +
            "  },\n";
    }

    newContent += "];\n";
    fs.writeFileSync(ARTICLES_PATH, newContent);
    console.log("Done.");
}

clean();
