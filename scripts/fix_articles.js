const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.join(__dirname, '../src/data/articles.ts');

try {
  let content = fs.readFileSync(ARTICLES_PATH, 'utf-8');

  // Regex to find objects closing and opening without a comma
  // Matches } followed by whitespace and then {
  // Captures the } and { to replace them with }, {
  const missingCommaRegex = /}\s*\n\s*{/g;
  
  // Also look for } { on same line or with any whitespace
  const simpleMissingCommaRegex = /}\s*{/g;

  let fixedContent = content;

  // Apply fixes
  // We check if it already has a comma to avoid double commas
  // Safer approach: replace any "} {" or "} \n {" with "}, {"
  // but then fix any potential ", ,"
  
  fixedContent = fixedContent.replace(/}\s*{/g, '},\n  {');
  fixedContent = fixedContent.replace(/},\s*,/g, '},'); // Fix double commas if we accidentally created them

  // Ensure it ends with ];
  fixedContent = fixedContent.trim();
  if (!fixedContent.endsWith('];')) {
    if (fixedContent.endsWith('}')) {
      fixedContent += '\n];';
    } else {
      // Find last brace
      const lastBrace = fixedContent.lastIndexOf('}');
      if (lastBrace !== -1) {
        fixedContent = fixedContent.substring(0, lastBrace + 1) + '\n];';
      }
    }
  }

  fs.writeFileSync(ARTICLES_PATH, fixedContent);
  console.log("Cleanup complete: All articles properly separated.");

} catch (err) {
  console.error("Error during cleanup:", err);
}