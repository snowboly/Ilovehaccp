const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

function fixArticles() {
    console.log("Reading articles.ts...");
    let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');
    
    // Using regex literal
    const blocks = content.match(/\{\s*slug:[\s\S]*?content:\s*`[\s\S]*?`[\s\S]*?\}/g);
    
    if (!blocks) {
        console.error("No articles found!");
        return;
    }

    console.log(`Found ${blocks.length} raw blocks.`);
    
    const parsedArticles = [];
    
    blocks.forEach(block => {
        const slugMatch = block.match(/slug:\s*["']([^"']+)["']/);
        const titleMatch = block.match(/title:\s*["']([^"']+)["']/);
        const categoryMatch = block.match(/category:\s*["']([^"']+)["']/);
        const readTimeMatch = block.match(/readTime:\s*["']([^"']+)["']/);
        const excerptMatch = block.match(/excerpt:\s*["']([^"']+)["']/);
        const publishedAtMatch = block.match(/publishedAt:\s*["']([^"']+)["']/);
        const imageMatch = block.match(/image:\s*["']([^"']+)["']/);
        const contentMatch = block.match(/content:\s*`([\s\S]*?)`/);

        if (slugMatch && contentMatch) {
            parsedArticles.push({
                slug: slugMatch[1],
                title: titleMatch ? titleMatch[1] : '',
                category: categoryMatch ? categoryMatch[1] : 'Compliance',
                readTime: readTimeMatch ? readTimeMatch[1] : '5 min read',
                excerpt: excerptMatch ? excerptMatch[1] : '',
                publishedAt: publishedAtMatch ? publishedAtMatch[1] : 'Jan 1, 2026',
                image: imageMatch ? imageMatch[1] : '',
                content: contentMatch[1]
            });
        }
    });

    const validArticles = parsedArticles.filter(a => a.content.trim().length > 100);
    console.log(`Removed ${parsedArticles.length - validArticles.length} broken articles.`);

    const uniqueArticlesMap = new Map();

    validArticles.forEach(article => {
        if (uniqueArticlesMap.has(article.slug)) {
            const existing = uniqueArticlesMap.get(article.slug);
            if (article.content.length > existing.content.length) {
                uniqueArticlesMap.set(article.slug, article);
            }
        } else {
            uniqueArticlesMap.set(article.slug, article);
        }
    });

    const uniqueArticles = Array.from(uniqueArticlesMap.values());
    console.log(`Final unique count: ${uniqueArticles.length}.`);

    let newFileContent = 'export interface Article {\n' +
        '  slug: string;\n' +
        '  title: string;\n' +
        '  category: string;\n' +
        '  readTime: string;\n' +
        '  excerpt: string;\n' +
        '  image?: string;\n' +
        '  content: string;\n' +
        '  publishedAt: string;\n' +
        '}\n\n' +
        'export const articles: Article[] = [\n';

    uniqueArticles.forEach(a => {
        // use replaceAll 
        const safeContent = a.content.replaceAll('`', '\`').replaceAll('${', '\${');
        const safeTitle = a.title.replaceAll('"', '\"');
        const safeExcerpt = a.excerpt.replaceAll('"', '\"');
        
        newFileContent += '  {\n' +
            '    slug: "' + a.slug + '",\n' +
            '    title: "' + safeTitle + '",\n' +
            '    category: "' + a.category + '",\n' +
            '    readTime: "' + a.readTime + '",\n' +
            '    excerpt: "' + safeExcerpt + '",\n' +
            '    publishedAt: "' + a.publishedAt + '",\n' +
            '    image: "' + a.image + '",\n' +
            '    content: `' + safeContent + '`\n' +
            '  },\n';
    });

    newFileContent += '];\n';

    fs.writeFileSync(ARTICLES_PATH, newFileContent);
    console.log("Successfully updated articles.ts");
}

fixArticles();