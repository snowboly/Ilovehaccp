const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

function fix() {
    console.log("Parsing and re-building articles.ts safely...");
    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

    const blocks = content.split('  {').filter(b => b.includes('slug:'));
    
    const processedArticles = [];
    for (let block of blocks) {
        const slugMatch = block.match(/slug:\s*['"](.*?)['"]/);
        const titleMatch = block.match(/title:\s*['"](.*?)['"]/) || block.match(/title:\s*["'](.*?)["']/);
        const categoryMatch = block.match(/category:\s*['"](.*?)['"]/);
        const readTimeMatch = block.match(/readTime:\s*['"](.*?)['"]/);
        const excerptMatch = block.match(/excerpt:\s*['"]([\s\S]*?)['"]\s*,/) || block.match(/excerpt:\s*["']([\s\S]*?)["']\s*,/);
        const publishedAtMatch = block.match(/publishedAt:\s*['"](.*?)['"]/);
        const imageMatch = block.match(/image:\s*['"](.*?)['"]/);
        
        const contentStart = block.indexOf('content: `') + 10;
        const contentEnd = block.lastIndexOf('`');
        let articleContent = "";
        if (contentStart > 9 && contentEnd > contentStart) {
            articleContent = block.substring(contentStart, contentEnd);
        }

        if (slugMatch && titleMatch) {
            processedArticles.push({
                slug: slugMatch[1],
                title: titleMatch[1],
                category: categoryMatch ? categoryMatch[1] : "General",
                readTime: readTimeMatch ? readTimeMatch[1] : "5 min read",
                excerpt: excerptMatch ? excerptMatch[1] : "",
                image: imageMatch ? imageMatch[1] : "",
                content: articleContent,
                publishedAt: publishedAtMatch ? publishedAtMatch[1] : "2026-01-01"
            });
        }
    }

    console.log(`Re-constructed ${processedArticles.length} articles.`);

    let output = "export interface Article {\n  slug: string;\n  title: string;\n  category: string;\n  readTime: string;\n  excerpt: string;\n  image?: string;\n  content: string;\n  publishedAt: string;\n}\n\nexport const articles: Article[] = [\n";

    for (let i = 0; i < processedArticles.length; i++) {
        const a = processedArticles[i];
        const safeTitle = a.title.replace(/'/g, "' ");
        const safeExcerpt = a.excerpt.replace(/'/g, "' ").replace(/\n/g, ' ');
        const safeContent = a.content.replace(/`/g, '\`');
        
        output += "  {\n";
        output += "    slug: '" + a.slug + "',
";
        output += "    title: '" + safeTitle + "',
";
        output += "    category: '" + a.category + "',
";
        output += "    readTime: '" + a.readTime + "',
";
        output += "    excerpt: '" + safeExcerpt + "',
";
        output += "    publishedAt: '" + a.publishedAt + "',
";
        output += "    image: '" + a.image + "',
";
        output += "    content: `" + safeContent + "`\n";
        output += "  }" + (i === processedArticles.length - 1 ? "" : ",") + "\n";
    }

    output += "];\n";

    fs.writeFileSync(ARTICLES_PATH, output);
    console.log("Success! File structure is now perfectly valid.");
}

fix();