const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

try {
  let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

  const slug = process.argv[2];
  if (!slug) {
    console.log("Usage: node scripts/dedupe_articles.js <slug>");
    process.exit(1);
  }
  const slugSearch = `slug: "${slug}"`; // Use double quotes as seen in file

  // Find all occurrences
  const indices = [];
  let pos = content.indexOf(slugSearch);
  while (pos !== -1) {
    indices.push(pos);
    pos = content.indexOf(slugSearch, pos + 1);
  }

  console.log(`Found ${indices.length} occurrences of slug: ${slug}`);

  if (indices.length < 2) {
    console.log("No duplicates found (or only one exists).");
    process.exit(0);
  }

  // We want to keep the LAST one (the new one).
  // We want to remove the FIRST one (the old one).
  const firstOccurrence = indices[0];

  // Find the start of the object (backwards to {)
  let startIndex = firstOccurrence;
  while (content[startIndex] !== '{' && startIndex > 0) {
    startIndex--;
  }

  // Find the end of the object (forwards to })
  let braceCount = 0;
  let endIndex = startIndex;
  let foundStart = false;

  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      foundStart = true;
    } else if (content[i] === '}') {
      braceCount--;
    }

    if (foundStart && braceCount === 0) {
      endIndex = i + 1;
      break;
    }
  }

  // Check if there is a comma after
  if (content[endIndex] === ',') {
    endIndex++;
  }

  console.log(`Removing object from index ${startIndex} to ${endIndex}`);
  
  const newContent = content.slice(0, startIndex) + content.slice(endIndex);
  
  // Cleanup potential empty lines or double commas (though we handled one comma)
  const cleanedContent = newContent.replace(/,\s*,/g, ',').replace(/^\s*[\r\n]/gm, '');

  fs.writeFileSync(ARTICLES_PATH, cleanedContent);
  console.log("Duplicate removed successfully.");

} catch (err) {
  console.error("Error:", err);
}
