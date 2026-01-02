const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

try {
  const content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

  // Regex to extract title and slug pairs
  // We look for: slug: "..." and title: "..." in the same block
  // This simplistic regex assumes slug comes before title or vice versa in a standard format
  // Based on the file, it's:
  // {
  //   slug: "...",
  //   title: "...",
  //   ...
  // }
  
  const matches = [];
  // Regex to extract title, slug, and readTime
  const articleRegex = /{\s*slug:\s*["'](.*?)["'][\s\S]*?title:\s*["'](.*?)["'][\s\S]*?readTime:\s*["'](.*?)["']/g;
  
  let match;
  while ((match = articleRegex.exec(content)) !== null) {
    matches.push({
      slug: match[1],
      title: match[2],
      readTime: match[3]
    });
  }

  console.log(`Found ${matches.length} articles in file.`);

  // Filter out the ones already upgraded (readTime: "45 min read")
  const pending = matches.filter(a => a.readTime !== '45 min read');
  console.log(`${matches.length - pending.length} articles already upgraded. ${pending.length} remaining.`);

  for (let i = 0; i < pending.length; i++) {
    const article = pending[i];
    console.log(`\n[${i + 1}/${pending.length}] Regenerating: "${article.title}" (${article.slug})`);

    try {
      // 1. Generate
      execSync(`node scripts/generate_expert_article.js "${article.title}" "${article.slug}"`, { stdio: 'inherit' });

      // 2. Dedupe
      try {
          execSync(`node scripts/dedupe_articles.js "${article.slug}"`, { stdio: 'inherit' });
      } catch (e) {}

      // 3. Fix format
      execSync(`node scripts/fix_articles.js`, { stdio: 'inherit' });
      
      console.log(`Completed: ${article.title}`);

      // Add a 5 second delay to avoid rate limits between articles
      if (i < pending.length - 1) {
          console.log("Waiting 5 seconds before next article...");
          execSync('powershell Start-Sleep -Seconds 5');
      }

    } catch (err) {
      console.error(`FAILED to regenerate "${article.title}":`, err.message);
      // Decide whether to continue or stop. We'll continue.
    }
  }

  console.log("\nAll done!");

} catch (err) {
  console.error("Error reading articles file:", err);
}
